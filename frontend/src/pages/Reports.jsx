import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./reports.css";

const reportTypes = {
  combined: "Combined Analytics",
  earnings: "Earnings",
  sponsorships: "Sponsorships",
};

const reportFormats = {
  excel: {
    label: "Excel",
    extension: "xlsx",
    contentType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  },
  pdf: {
    label: "PDF",
    extension: "pdf",
    contentType: "application/pdf",
  },
};

function getFilename(response, type, format) {
  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^";]+)"?/i);

  if (match) {
    return match[1];
  }

  const today = new Date();
  const date = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return `creatoriq_${type}_${date}.${format.extension}`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getRequestError(error) {
  const status = error.response?.status;

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You are not authorized to generate this report.";
  }

  if (status === 404) {
    return "This report is unavailable. Please try another report type.";
  }

  if (status) {
    return "The report could not be generated. Please try again.";
  }

  return "Could not connect to the report service. Check that the backend is running.";
}

export default function Reports() {
  const navigate = useNavigate();
  const isGeneratingRef = useRef(false);
  const [reportType, setReportType] = useState("combined");
  const [reportFormat, setReportFormat] = useState("excel");
  const [generatingFormat, setGeneratingFormat] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [isAuthenticated] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  const generateReport = async (formatKey) => {
    if (isGeneratingRef.current) {
      return;
    }

    if (!localStorage.getItem("token")) {
      setError("Please sign in to generate and download reports.");
      setMessage("");
      return;
    }

    isGeneratingRef.current = true;
    setGeneratingFormat(formatKey);
    setError("");
    setMessage("");

    try {
      const format = reportFormats[formatKey];
      const response = await api.get(
        `/reports/${reportType}/${formatKey}`,
        { responseType: "blob" }
      );

      const contentType = (
        response.headers["content-type"] || response.data.type || ""
      )
        .split(";")[0]
        .trim()
        .toLowerCase();

      if (
        !response.data.size ||
        contentType !== format.contentType
      ) {
        throw new Error(`The server did not return a valid ${format.label} file.`);
      }

      const filename = getFilename(response, reportType, format);
      downloadBlob(response.data, filename);

      const generatedAt = new Date();
      setHistory((current) => [
        {
          id: `${generatedAt.getTime()}-${formatKey}`,
          filename,
          format: format.label,
          generatedAt,
        },
        ...current,
      ]);
      setMessage(`${filename} was generated and downloaded.`);
    } catch (requestError) {
      setError(
        requestError.response
          ? getRequestError(requestError)
          : requestError.message || getRequestError(requestError)
      );
    } finally {
      isGeneratingRef.current = false;
      setGeneratingFormat("");
    }
  };

  return (
    <div className="reports-page">
      <aside className="reports-sidebar">
        <button
          className="reports-logo"
          onClick={() => navigate("/dashboard")}
        >
          ✦ CreatorIQ
        </button>
        <nav aria-label="Main navigation">
          <button onClick={() => navigate("/dashboard")}><span>▦</span> Dashboard</button>
          <button onClick={() => navigate("/content")}><span>▤</span> Content</button>
          <button onClick={() => navigate("/audience")}><span>◉</span> Audience</button>
          <button onClick={() => navigate("/growth-trends")}><span>↗</span> Growth &amp; Trends</button>
          <button onClick={() => navigate("/earnings")}><span>₹</span> Earnings</button>
          <button onClick={() => navigate("/sponsorships")}><span>◇</span> Sponsorships</button>
          <button onClick={() => navigate("/social-media")}><span>◎</span> Social Media</button>
          <button className="active" aria-current="page"><span>▧</span> Reports</button>
          <button onClick={() => navigate("/instagram-analytics")}><span>◎</span> Instagram Analytics</button>
          <button onClick={() => navigate("/settings")}><span>⚙</span> Settings</button>
        </nav>
      </aside>

      <main className="reports-main">
        <header className="reports-header">
          <div>
            <span className="reports-eyebrow">CREATORIQ WORKSPACE</span>
            <h1>Reports</h1>
            <p>Generate and download your creator analytics reports.</p>
          </div>
          <button
            className="reports-primary"
            onClick={() => generateReport(reportFormat)}
            disabled={Boolean(generatingFormat) || !isAuthenticated}
          >
            {generatingFormat ? "Generating..." : "Generate Report"}
          </button>
        </header>

        {!isAuthenticated && (
          <div className="reports-alert" role="alert">
            <span>Sign in to generate and download your reports.</span>
            <button onClick={() => navigate("/login")}>Sign in</button>
          </div>
        )}
        {error && <div className="reports-alert error" role="alert">{error}</div>}
        {message && <div className="reports-alert success" role="status">{message}</div>}

        <section className="reports-controls">
          <div>
            <label htmlFor="report-type">Report contents</label>
            <select
              id="report-type"
              value={reportType}
              onChange={(event) => setReportType(event.target.value)}
              disabled={Boolean(generatingFormat)}
            >
              {Object.entries(reportTypes).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="report-format">Report format</label>
            <select
              id="report-format"
              value={reportFormat}
              onChange={(event) => setReportFormat(event.target.value)}
              disabled={Boolean(generatingFormat)}
            >
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
            </select>
          </div>
          <p>
            Reports include all records currently available for your account.
          </p>
        </section>

        <section className="reports-format-grid" aria-label="Report formats">
          <article className="reports-format-card">
            <div className="reports-format-icon excel" aria-hidden="true">X</div>
            <div className="reports-format-copy">
              <span className="reports-format-tag">SPREADSHEET</span>
              <h2>Excel Report</h2>
              <p>Download a formatted workbook you can review and work with in Excel.</p>
              <span className="reports-extension">.xlsx</span>
            </div>
            <button
              className="reports-secondary"
              onClick={() => generateReport("excel")}
              disabled={Boolean(generatingFormat) || !isAuthenticated}
            >
              {generatingFormat === "excel" ? "Generating..." : "Generate Excel"}
            </button>
          </article>

          <article className="reports-format-card">
            <div className="reports-format-icon pdf" aria-hidden="true">PDF</div>
            <div className="reports-format-copy">
              <span className="reports-format-tag">DOCUMENT</span>
              <h2>PDF Report</h2>
              <p>Download a shareable, print-ready report of your creator data.</p>
              <span className="reports-extension">.pdf</span>
            </div>
            <button
              className="reports-secondary"
              onClick={() => generateReport("pdf")}
              disabled={Boolean(generatingFormat) || !isAuthenticated}
            >
              {generatingFormat === "pdf" ? "Generating..." : "Generate PDF"}
            </button>
          </article>
        </section>

        <section className="reports-history">
          <div className="reports-history-heading">
            <div>
              <h2>Recent Reports</h2>
              <p>Successful downloads from this session only.</p>
            </div>
            <span>{history.length} {history.length === 1 ? "report" : "reports"}</span>
          </div>

          {history.length === 0 ? (
            <div className="reports-empty">
              <span aria-hidden="true">▧</span>
              <strong>No reports generated yet</strong>
              <p>Your completed downloads will appear here during this session.</p>
            </div>
          ) : (
            <ul className="reports-history-list">
              {history.map((report) => (
                <li key={report.id}>
                  <span className={`reports-file-icon ${report.format.toLowerCase()}`}>
                    {report.format === "Excel" ? "X" : "PDF"}
                  </span>
                  <div className="reports-history-name">
                    <strong>{report.filename}</strong>
                    <span>{report.format} · {report.generatedAt.toLocaleString()}</span>
                  </div>
                  <span className="reports-complete">Downloaded</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
