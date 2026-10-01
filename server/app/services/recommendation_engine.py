from typing import List, Dict, Any
from app.models import User, UserRole

class RecommendationEngine:
    @staticmethod
    def get_actionable_insights(user: User) -> List[Dict[str, Any]]:
        base_insights = [
            {
                "id": "rec-1",
                "category": "Timing",
                "title": "Optimal Posting Window: 6:00 PM - 8:30 PM EST",
                "description": "Your audience shows 38% higher retention and comment volume when posting during Thursday - Saturday peak evening hours.",
                "impact": "High",
                "score": 94,
                "platform": "YouTube"
            },
            {
                "id": "rec-2",
                "category": "Content Format",
                "title": "Short-Form Video Spikes Reach by 2.4x",
                "description": "Reels under 45 seconds paired with trending audio have yielded a 14.8% engagement rate, beating your feed average by 6.2%.",
                "impact": "High",
                "score": 89,
                "platform": "Instagram"
            },
            {
                "id": "rec-3",
                "category": "Monetization",
                "title": "Unmonetized Tech Audience in North America",
                "description": "42% of your audience is US-based tech enthusiasts. Recommended CPM for sponsored integrations is $45 - $65 per 1k views.",
                "impact": "Medium",
                "score": 82,
                "platform": "All Platforms"
            },
            {
                "id": "rec-4",
                "category": "Community",
                "title": "Reply to First 30 Comments within 1 Hour",
                "description": "YouTube's recommendation algorithm rewards rapid creator interaction on new uploads with up to 22% more browse placement.",
                "impact": "Medium",
                "score": 78,
                "platform": "YouTube"
            }
        ]

        if user.role == UserRole.AGENCY:
            base_insights.insert(0, {
                "id": "rec-agency",
                "category": "Agency Strategy",
                "title": "Roster Expansion: High Demand in B2B Tech",
                "description": "Brands are offering 28% higher contract sizes for LinkedIn & YouTube cross-syndicated tech creators this quarter.",
                "impact": "Critical",
                "score": 97,
                "platform": "Agency Workspace"
            })
        elif user.role == UserRole.MARKETING_TEAM:
            base_insights.insert(0, {
                "id": "rec-mkt",
                "category": "Campaign ROI",
                "title": "Micro-Creator Batching Outperforms Mega-Influencers",
                "description": "Allocating budget across 5 mid-tier creators (50k-150k followers) produces 40% lower CAC than single celebrity deals.",
                "impact": "Critical",
                "score": 96,
                "platform": "Marketing Team"
            })

        return base_insights
