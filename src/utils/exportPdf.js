import html2pdf from "html2pdf.js";

export async function exportPDF() {
  const summary =
    document.getElementById("case-summary") ||
    document.querySelector(".summary-card-wrapper");

  if (!summary) {
    alert("Could not locate Case Summary in the DOM.");
    return;
  }

  const clone = summary.cloneNode(true);
  clone.id = "print-summary";
  clone.style.display = "block";

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/assets/css/summary.css";
  clone.prepend(link);

  document.body.appendChild(clone);

  await html2pdf()
    .set({
      filename: "CaseSummary.pdf",
      margin: 10,
      html2canvas: { scale: 2, useCORS: true },
      pagebreak: { mode: ["avoid-all"] },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      printMediaType: true,
    })
    .from(clone)
    .save();

  clone.remove();
}

export const handleExportClick = () => setTimeout(exportPDF, 0);

export default exportPDF;
