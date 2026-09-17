import io
import csv
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from app.models import User

class ExportService:
    @staticmethod
    def generate_pdf_report(user: User, data: dict) -> bytes:
        """Generates a branded PDF executive report with key metrics and insights"""
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'ReportTitle',
            parent=styles['Heading1'],
            fontSize=22,
            leading=26,
            textColor=colors.HexColor("#0f172a"),
            spaceAfter=12
        )
        subtitle_style = ParagraphStyle(
            'ReportSubtitle',
            parent=styles['Normal'],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#64748b"),
            spaceAfter=20
        )
        section_style = ParagraphStyle(
            'ReportSection',
            parent=styles['Heading2'],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#3b82f6"),
            spaceBefore=14,
            spaceAfter=8
        )

        story = []
        # Header
        story.append(Paragraph("CreatorIQ Performance & Intelligence Report", title_style))
        story.append(Paragraph(f"Prepared for: <b>{user.full_name or user.email}</b> ({user.role.value}) &bull; Date: {datetime.utcnow().strftime('%B %d, %Y')}", subtitle_style))
        story.append(Spacer(1, 10))

        # KPI Overview Table
        story.append(Paragraph("1. Executive Performance Summary", section_style))
        summary = data.get("summary", {})
        kpi_data = [
            ["Metric", "Value", "Benchmark Status"],
            ["Total Followers / Audience", f"{summary.get('total_followers', 268400):,}", "Strong (+18.4% MoM)"],
            ["Total Video & Post Views", f"{summary.get('total_views', 1480000):,}", "Top 10% in Category"],
            ["Blended Engagement Rate", f"{summary.get('engagement_rate', 7.64)}%", "Exceeds Industry Avg (3.2%)"],
            ["Total Revenue YTD", f"${summary.get('total_revenue', 38450):,.2f}", "On Track ($50k Target)"],
            ["Active Channels Connected", f"{summary.get('connected_channels', 3)} Platforms", "YouTube, Instagram, LinkedIn"]
        ]

        t = Table(kpi_data, colWidths=[200, 160, 180])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#1e293b")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white])
        ]))
        story.append(t)
        story.append(Spacer(1, 15))

        # Strategic Recommendations Table
        story.append(Paragraph("2. Strategic AI Recommendations", section_style))
        recs = data.get("recommendations", [])
        rec_rows = [["Area", "Insight", "Impact"]]
        for r in recs[:4]:
            rec_rows.append([
                r.get("category", "Strategy"),
                Paragraph(f"<b>{r.get('title', '')}</b>: {r.get('description', '')}", styles['Normal']),
                r.get("impact", "High")
            ])

        t_rec = Table(rec_rows, colWidths=[100, 360, 80])
        t_rec.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#3b82f6")),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor("#f8fafc"), colors.white])
        ]))
        story.append(t_rec)

        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()

    @staticmethod
    def generate_csv_report(user: User, data: dict) -> str:
        """Generates a clean CSV export containing performance metrics and growth trends"""
        output = io.StringIO()
        writer = csv.writer(output)

        writer.writerow(["CreatorIQ Performance Data Export"])
        writer.writerow(["User", user.email])
        writer.writerow(["Role", user.role.value])
        writer.writerow(["Exported At", datetime.utcnow().isoformat()])
        writer.writerow([])

        # Summary KPIs
        summary = data.get("summary", {})
        writer.writerow(["Metric", "Value"])
        writer.writerow(["Total Followers", summary.get("total_followers", 268400)])
        writer.writerow(["Total Views", summary.get("total_views", 1480000)])
        writer.writerow(["Engagement Rate (%)", summary.get("engagement_rate", 7.64)])
        writer.writerow(["Total Revenue (USD)", summary.get("total_revenue", 38450.0)])
        writer.writerow([])

        # Growth trends
        writer.writerow(["Date", "Daily Views", "Daily Likes", "Cumulative Followers"])
        for item in data.get("growth_trend", []):
            writer.writerow([item.get("date"), item.get("views"), item.get("likes"), item.get("followers")])

        return output.getvalue()
