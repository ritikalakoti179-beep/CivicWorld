// =========================================
// CIVICWORLD ADMIN DASHBOARD
// =========================================

document.addEventListener("DOMContentLoaded", function () {

    loadCitizenReports();
    updateDashboardStats();
    analyzeSimilarReports();
    analyzePriorityInsights();
    updatePriorityMap();


});


// =========================================
// LOAD CITIZEN REPORTS
// =========================================

function loadCitizenReports() {

    const reports =
        JSON.parse(localStorage.getItem("civicReports") || "[]");

    const table =
        document.querySelector(".reports-table");

    if (!table) return;

    table.innerHTML = `
        <div class="report-header">

            <span>Issue</span>
            <span>Category</span>
            <span>Location</span>
            <span>Evidence</span>
            <span>Status</span>

        </div>
    `;

    if (reports.length === 0) {

        table.innerHTML += `
            <div class="report-row">

                <span>No citizen reports yet.</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>
                <span>—</span>

            </div>
        `;

        return;
    }

    reports.slice().reverse().forEach(function(report) {

        table.innerHTML += `
            <div class="report-row">

                <span>${report.message}</span>

                <span>${report.category}</span>

                <span>${report.location || "Not specified"}</span>
                
               <span>${report.photoAttached ? "📷 Photo attached" : "—"}</span>
                <span>

                    <select
                        onchange="updateReportStatus(${report.id}, this.value)"
                        style="
                            padding:6px;
                            border-radius:6px;
                            background:#07111f;
                            color:white;
                            border:1px solid #334155;
                        ">

                        <option value="Submitted"
                            ${report.status === "Submitted" ? "selected" : ""}>
                            Submitted
                        </option>

                        <option value="In Progress"
                            ${report.status === "In Progress" ? "selected" : ""}>
                            In Progress
                        </option>

                        <option value="Completed"
                            ${report.status === "Completed" ? "selected" : ""}>
                            Completed
                        </option>

                    </select>

                </span>

            </div>
        `;

    });

}


// =========================================
// UPDATE DASHBOARD STATS
// =========================================

function updateDashboardStats() {

    const reports =
        JSON.parse(localStorage.getItem("civicReports")) || [];

    const feedbackCount =
        reports.filter(r => r.type === "feedback").length;

    const problemCount =
        reports.filter(r => r.type === "problem").length;

    const suggestionCount =
        reports.filter(r => r.type === "suggestion").length;

    const statCards =
        document.querySelectorAll(".stat-card h2");

    if (statCards.length >= 4) {

        statCards[0].textContent = feedbackCount;
        statCards[1].textContent = problemCount;
        statCards[2].textContent = suggestionCount;

        statCards[3].textContent =
            reports.filter(
                r => r.status === "Completed"
            ).length;
    }

}

// =========================================
// AI CIVIC SUMMARY
// =========================================

function generateCivicSummary() {

    const reports =
        JSON.parse(
            localStorage.getItem("civicReports") || "[]"
        );

    const summary =
        document.getElementById("aiSummary");

    if (!summary) return;

    if (reports.length === 0) {

        summary.innerHTML = `
            <p>
                No citizen reports are available yet.
            </p>
        `;

        return;
    }

    const categories = {};

    reports.forEach(function (report) {

        const category = report.category;

        if (!categories[category]) {
            categories[category] = 0;
        }

        categories[category]++;

    });

    let topCategory = "";
    let topCount = 0;

    for (const category in categories) {

        if (categories[category] > topCount) {

            topCategory = category;
            topCount = categories[category];

        }

    }

    summary.innerHTML = `

        <p>
            🤖 <strong>AI Civic Analysis</strong>
        </p>

        <p>
            ${reports.length} citizen report(s) have
            been submitted in this demo locality.
        </p>

        <p>
            The most frequently reported category is
            <strong>${topCategory}</strong>
            with ${topCount} report(s).
        </p>

        <p>
            Similar reports can be grouped together
            to help administrators understand recurring
            community concerns.
        </p>

        <p class="ai-note">
            AI assists with organizing citizen information.
            Final decisions remain with authorized officials.
        </p>

    `;

}

// =========================================
// SIMILAR CITIZEN REPORT GROUPING
// =========================================

function analyzeSimilarReports() {

    const reports =
        JSON.parse(localStorage.getItem("civicReports") || "[]");

    const container =
        document.getElementById("similarReports");

    if (!container) return;

    if (reports.length < 2) {

        container.innerHTML = `
            <p>
                At least 2 citizen reports are needed
                for similarity analysis.
            </p>
        `;

        return;
    }

    const groups = {};

    reports.forEach(function(report) {

        const category =
            (report.category || "Other").trim();

        if (!groups[category]) {
            groups[category] = [];
        }

        groups[category].push(report);

    });

    let html = "";

    Object.keys(groups).forEach(function(category) {

        const group = groups[category];

        if (group.length >= 2) {

            html += `
                <div class="similar-group">

                    <h4>
                        🔗 ${category}
                    </h4>

                    <p>
                        ${group.length} similar reports
                        detected
                    </p>

                    <ul>
                        ${group.map(function(report) {
                            return `
                                <li>
                                    ${report.message}
                                </li>
                            `;
                        }).join("")}
                    </ul>

                </div>
            `;

        }

    });

    if (html === "") {

        html = `
            <p>
                No recurring categories detected yet.
            </p>
        `;

    }

    container.innerHTML = html;
}

// =========================================
// AI PRIORITY INSIGHTS
// =========================================

function analyzePriorityInsights() {

    const reports =
        JSON.parse(localStorage.getItem("civicReports") || "[]");

    const container =
        document.getElementById("priorityInsights");

    if (!container) return;

    if (reports.length === 0) {

        container.innerHTML = `
            <p>No citizen reports available yet.</p>
        `;

        return;
    }

    const categories = {};

    reports.forEach(function(report) {

        const category =
            (report.category || "Other").trim();

        categories[category] =
            (categories[category] || 0) + 1;

    });

    let html = "";

    Object.keys(categories).forEach(function(category) {

        const count = categories[category];

        let priority = "Normal";

        if (count >= 3) {
            priority = "High";
        } else if (count === 2) {
            priority = "Medium";
        }

        html += `
            <div class="priority-item">

                <strong>${category}</strong>

                <span>
                    ${count} report(s) — ${priority} attention
                </span>

            </div>
        `;

    });

    container.innerHTML = html;
}

// =========================================
// UPDATE REPORT STATUS
// =========================================

function updateReportStatus(reportId, newStatus) {

    const reports =
        JSON.parse(localStorage.getItem("civicReports") || "[]");

    const report =
        reports.find(function(item) {
            return item.id === reportId;
        });

    if (!report) return;

    report.status = newStatus;

    localStorage.setItem(
        "civicReports",
        JSON.stringify(reports)
    );

    updateDashboardStats();

    alert(
        "Report status updated to: " +
        newStatus
    );

}

// =========================================
// CIVIC PRIORITY MAP DATA
// =========================================

function updatePriorityMap() {

    const reports =
        JSON.parse(localStorage.getItem("civicReports") || "[]");

    const map =
        document.getElementById("priorityMap");

    if (!map) return;

    const categories = {};

    reports.forEach(function(report) {

        const category =
            (report.category || "Other").trim();

        categories[category] =
            (categories[category] || 0) + 1;

    });

    const zones = [
        "🏥 Hospital Area",
        "🌳 Park Area",
        "🏫 School Area",
        "🚌 Bus Stop Area"
    ];

    let html = `
        <div class="map-grid">
    `;

    zones.forEach(function(zone) {

        const cleanZone =
            zone.replace(/[^\w\s]/gi, "").trim();

        let relatedCount = 0;

        Object.keys(categories).forEach(function(category) {

            if (
                category.toLowerCase().includes("lighting") ||
                category.toLowerCase().includes("road") ||
                category.toLowerCase().includes("clean")
            ) {
                relatedCount += categories[category];
            }

        });

        let level = "No reports";

        if (relatedCount >= 3) {
            level = "High attention";
        } else if (relatedCount === 2) {
            level = "Medium attention";
        } else if (relatedCount === 1) {
            level = "Normal";
        }

        html += `
            <div class="map-zone">

                <div>

                    <strong>${zone}</strong>

                    <br>

                    <small>
                        ${level}
                    </small>

                </div>

            </div>
        `;

    });

    html += `</div>`;

    map.innerHTML = html;
}