import unittest

from fastapi import HTTPException
from pydantic import ValidationError
from starlette.requests import Request

from app.analytics.routes import verify_creator_access as verify_analytics_access
from app.audience.routes import verify_creator_access as verify_audience_access
from app.auth.routes import RegisterRequest
from app.auth.security import get_current_creator
from app.auth.security import (
    create_provider_oauth_state,
    create_provider_owner_cookie,
    get_provider_oauth_state_owner,
    get_provider_owner_id,
    require_provider_owner,
)
from app.models import User
from app.earnings.routes import verify_creator_access as verify_earnings_access
from app.reports.routes import router as reports_router
from app.social.routes import router as social_router
from app.sponsorships.routes import router as sponsorships_router


def route_dependencies(route):
    declared = [
        dependency.dependency
        for dependency in route.dependencies
    ]
    resolved = [
        dependency.call
        for dependency in route.dependant.dependencies
    ]
    return declared + resolved


class RoleAccessTests(unittest.TestCase):
    def test_creator_can_use_creator_only_features(self):
        creator = User(id=7, role="Creator")

        self.assertIs(get_current_creator(creator), creator)
        verify_analytics_access(7, creator)
        verify_audience_access(7, creator)
        verify_earnings_access(7, creator)

    def test_non_creator_roles_cannot_use_creator_only_features(self):
        for role in (
            "Marketing Team",
            "Agency",
            "Administrator",
            "Unknown Role",
        ):
            with self.subTest(role=role):
                with self.assertRaises(HTTPException) as error:
                    get_current_creator(User(id=7, role=role))

                self.assertEqual(error.exception.status_code, 403)

    def test_creator_cannot_read_or_write_another_users_data(self):
        creator = User(id=7, role="Creator")
        checks = (
            verify_analytics_access,
            verify_audience_access,
            verify_earnings_access,
        )

        for check in checks:
            with self.subTest(check=check.__module__):
                with self.assertRaises(HTTPException) as error:
                    check(8, creator)

                self.assertEqual(error.exception.status_code, 403)

    def test_public_registration_rejects_administrator_role(self):
        with self.assertRaises(ValidationError):
            RegisterRequest(
                name="Admin",
                email="admin@example.com",
                password="password",
                role="Administrator",
            )

    def test_public_registration_accepts_supported_roles(self):
        for role in ("Creator", "Marketing Team", "Agency"):
            with self.subTest(role=role):
                request = RegisterRequest(
                    name="Test User",
                    email="user@example.com",
                    password="password",
                    role=role,
                )
                self.assertEqual(request.role, role)

    def test_reports_and_sponsorship_routes_require_creator_role(self):
        for route in (*reports_router.routes, *sponsorships_router.routes):
            with self.subTest(path=route.path):
                self.assertIn(
                    get_current_creator,
                    route_dependencies(route),
                )

    def test_private_social_account_routes_require_creator_role(self):
        directly_protected_paths = {
            "/social/x/status",
            "/social/x/connect",
            "/social/youtube/connect",
            "/social/x/me",
        }
        owner_bound_paths = {
            "/social/youtube/me",
            "/social/youtube/audience",
            "/social/youtube/monthly-performance",
            "/social/youtube/audience/age",
            "/social/youtube/audience/gender",
            "/social/youtube/audience/country",
        }
        routes = {
            route.path: route
            for route in social_router.routes
        }

        for path in directly_protected_paths:
            with self.subTest(path=path):
                self.assertIn(path, routes)
                self.assertIn(
                    get_current_creator,
                    route_dependencies(routes[path]),
                )

        for path in owner_bound_paths:
            with self.subTest(path=path):
                self.assertTrue(
                    any(
                        dependency.__name__ == "owner_checker"
                        for dependency in route_dependencies(routes[path])
                    )
                )

    def test_oauth_state_and_provider_cookie_are_user_bound(self):
        state_cookie = create_provider_oauth_state(
            "youtube",
            user_id=7,
            state="random-state",
        )
        owner_cookie = create_provider_owner_cookie("youtube", 7)

        self.assertEqual(
            get_provider_oauth_state_owner(
                state_cookie,
                "youtube",
                "random-state",
            ),
            7,
        )
        self.assertIsNone(
            get_provider_oauth_state_owner(
                state_cookie,
                "x",
                "random-state",
            )
        )
        self.assertEqual(get_provider_owner_id(owner_cookie, "youtube"), 7)
        self.assertIsNone(get_provider_owner_id(owner_cookie, "x"))

    def test_provider_cookie_cannot_be_used_by_another_creator(self):
        owner_cookie = create_provider_owner_cookie("youtube", 7)
        request = Request({
            "type": "http",
            "method": "GET",
            "path": "/social/youtube/me",
            "headers": [
                (b"cookie", f"youtube_owner={owner_cookie}".encode()),
            ],
        })
        owner_check = require_provider_owner("youtube")

        self.assertEqual(
            owner_check(request, User(id=7, role="Creator")).id,
            7,
        )
        with self.assertRaises(HTTPException) as error:
            owner_check(request, User(id=8, role="Creator"))

        self.assertEqual(error.exception.status_code, 403)


if __name__ == "__main__":
    unittest.main()
