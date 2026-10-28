import React, { useRef } from 'react';
import { DiagnosticResult, Language, LabConfig } from '../types/parasitology';
import { translations } from '../translations';
import { 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  User, 
  FileCheck, 
  Hospital, 
  Stethoscope, 
  Microscope,
  Award
} from 'lucide-react';

interface MedicalReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DiagnosticResult | null;
  labConfig: LabConfig;
  language: Language;
}

export const MedicalReportModal: React.FC<MedicalReportModalProps> = ({
  isOpen,
  onClose,
  result,
  labConfig,
  language,
}) => {
  if (!isOpen || !result) return null;
  const t = translations[language];
  const printContainerRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate simple downloadable HTML report
    if (!printContainerRef.current) return;
    const reportHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t.reportTitle} - ${result.patient.fullName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; padding: 24px; line-height: 1.5; }
            h1 { font-size: 18px; text-transform: uppercase; margin-bottom: 4px; }
            .header { border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
            .section { margin-bottom: 18px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background: #f1f5f9; font-weight: bold; }
            .stamp { border: 2px dashed #0284c7; padding: 12px; border-radius: 8px; text-align: center; color: #0284c7; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${labConfig.hospitalName}</h2>
            <p>${labConfig.departmentName} · ${labConfig.accreditationNumber}</p>
            <p>${labConfig.address} · Tél: ${labConfig.phone}</p>
          </div>
          <h1>${t.reportTitle}</h1>
          <p><strong>N° Dossier:</strong> ${result.patient.fileNumber} | <strong>Patient:</strong> ${result.patient.fullName} (${result.patient.age} ans, ${result.patient.gender})</p>
          <p><strong>Échantillon:</strong> ${result.patient.sampleId} | <strong>Date:</strong> ${result.detectionDate}</p>
          <hr />
          <h3>${t.resultsSection}</h3>
          <p><strong>Diagnostic:</strong> ${result.primaryFinding}</p>
          <p><strong>Charge parasitaire:</strong> ${result.infectionSeverity.toUpperCase()} (Estimation: ${result.estimatedEPG.toLocaleString()} EPG)</p>
          <p><strong>Conclusion:</strong> ${result.biologistNotes}</p>
          <br /><br />
          <div class="grid">
            <div class="stamp">
              CACHET DU LABORATOIRE<br />${labConfig.accreditationNumber}
            </div>
            <div>
              <p><strong>Validation biologique :</strong></p>
              <p>${result.validatedBy}</p>
              <p>Signature électronique certifiée</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const blob = new Blob([reportHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_DAP_${result.patient.fileNumber}_${result.patient.sampleId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs overflow-y-auto">
      
      {/* Modal Container */}
      <div className="bg-slate-100 rounded-2xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden my-auto">
        
        {/* Top Control Bar (Non-printed) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-sky-400" />
            <span className="font-semibold text-sm">
              {t.reportTitle}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({result.id})
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>{t.printReport}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>{t.downloadPdf}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Medical A4 Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200/50 flex justify-center">
          
          <div 
            ref={printContainerRef}
            className="print-only-container bg-white w-full max-w-3xl rounded-xl shadow-lg border border-slate-200 p-8 sm:p-10 text-slate-900"
          >
            
            {/* Header: Hospital & Laboratory Branding */}
            <div className="border-b-2 border-sky-600 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-sky-700 text-white flex items-center justify-center shrink-0">
                    <Hospital className="w-7 h-7" />
                  </div>
                  <div>
                    <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {labConfig.hospitalName}
                    </h1>
                    <p className="text-xs font-semibold text-sky-800 mt-0.5">
                      {labConfig.departmentName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {labConfig.address} · Tél: {labConfig.phone}
                    </p>
                  </div>
                </div>

                <div className="text-right flex flex-col items-start sm:items-end">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {labConfig.accreditationNumber}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono mt-1">
                    Système DAP-AI v2.4 (ONNX)
                  </span>
                </div>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-4 mb-6">
              <h2 className="text-sm font-bold tracking-wide text-slate-900 uppercase">
                {t.reportTitle}
              </h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                {t.reportSubtitle}
              </p>
            </div>

            {/* Two-Column Grid: Patient Info & Specimen Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
              
              {/* Patient Identification Card */}
              <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-sky-800">
                  <User className="w-3.5 h-3.5" />
                  <span>{t.patientInfoSection}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.patientFullName} :</span>
                    <span className="font-bold text-slate-900">{result.patient.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.patientFileNo} :</span>
                    <span className="font-mono font-semibold text-slate-800">{result.patient.fileNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.patientAge} / {t.patientGender} :</span>
                    <span className="font-medium">{result.patient.age} ans · {result.patient.gender === 'M' ? t.male : t.female}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.department} :</span>
                    <span className="font-medium text-slate-800 truncate max-w-[170px]">{result.patient.department}</span>
                  </div>
                </div>
              </div>

              {/* Specimen & Exam Details Card */}
              <div className="bg-slate-50/80 rounded-lg p-3.5 border border-slate-200">
                <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5 text-sky-800">
                  <Microscope className="w-3.5 h-3.5" />
                  <span>{t.examinationInfoSection}</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.sampleId} :</span>
                    <span className="font-mono font-semibold text-slate-800">{result.patient.sampleId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.sampleType} :</span>
                    <span className="font-medium text-slate-800">{result.patient.sampleType.toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.prescribingDoctor} :</span>
                    <span className="font-medium text-slate-800">{result.patient.prescribingDoctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t.dateCol} :</span>
                    <span className="font-mono text-slate-800">{result.detectionDate}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* AI Annotated Micrograph Section */}
            <div className="mb-6">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sky-800">
                  <Microscope className="w-3.5 h-3.5" />
                  <span>{t.microscopicImageSection}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  Grossissement : 40x (Objectif plan-achromatique)
                </span>
              </div>

              <div className="relative border border-slate-300 rounded-lg overflow-hidden max-h-60 bg-black flex items-center justify-center">
                <img
                  src={result.imageSrc}
                  alt="Micrograph result"
                  className="max-h-60 w-auto object-contain block"
                  referrerPolicy="no-referrer"
                />

                {/* Drawn Bounding boxes for Print */}
                {result.detections.map((box) => (
                  <div
                    key={box.id}
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.width}%`,
                      height: `${box.height}%`,
                      borderColor: box.color,
                    }}
                    className="absolute border-2 rounded pointer-events-none"
                  >
                    <span
                      style={{ backgroundColor: box.color }}
                      className="absolute -top-4 left-0 px-1 py-0.2 rounded text-[8px] font-bold text-white shadow-xs"
                    >
                      {box.speciesScientific} ({Math.round(box.confidence * 100)}%)
                    </span>
                  </div>
                ))}

                {/* Scale bar overlay */}
                <div className="absolute bottom-2 right-2 bg-black/80 rounded px-1.5 py-0.5 text-[9px] font-mono text-white flex items-center gap-1.5">
                  <div className="w-8 h-0.5 bg-white" />
                  <span>50 µm</span>
                </div>
              </div>
            </div>

            {/* Quantitative Results Table */}
            <div className="mb-6">
              <div className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 text-sky-800">
                {t.resultsSection}
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">{t.parasiteNameCol}</th>
                      <th className="py-2 px-3">{t.stageCol}</th>
                      <th className="py-2 px-3 text-center">{t.countCol}</th>
                      <th className="py-2 px-3">{t.dimensionsCol}</th>
                      <th className="py-2 px-3 text-right">{t.severityCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {result.detections.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-3 px-3 text-center text-slate-500 italic">
                          {t.severityNegative}
                        </td>
                      </tr>
                    ) : (
                      result.detections.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 font-semibold text-slate-900">
                            <span className="font-mono text-sky-800 text-[10px] mr-1.5 font-bold">
                              [Class {d.classIndex !== undefined ? d.classIndex : ''}]
                            </span>
                            <span className="italic">{d.speciesScientific}</span>
                            <span className="text-slate-500 font-normal text-[10px] ml-1">({d.speciesName})</span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {d.stage}
                          </td>
                          <td className="py-2 px-3 text-center font-mono font-bold text-sky-700">
                            1
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-600">
                            {d.dimensionsUm}
                          </td>
                          <td className="py-2 px-3 text-right font-medium">
                            <span className="font-semibold text-rose-700">
                              {result.infectionSeverity.toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Diagnostic Conclusion & Clinical Remarks */}
            <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-4 mb-6">
              <div className="text-xs font-bold text-sky-900 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-sky-700" />
                <span>{t.diagnosticConclusion}</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-medium">
                {result.primaryFinding}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {result.biologistNotes}
              </p>
              <div className="mt-2 pt-2 border-t border-sky-200/80 text-[11px] text-slate-500">
                <strong>Estimation globale de charge :</strong> {result.estimatedEPG.toLocaleString()} Œufs/Gramme (EPG). Conforme aux référentiels OMS de parasitologie clinique.
              </div>
            </div>

            {/* Validation & Official Signatures & Stamp */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              
              {/* Official Stamp */}
              <div className="border-2 border-dashed border-sky-400 rounded-xl p-4 flex flex-col items-center justify-center text-center text-sky-800 bg-sky-50/30">
                <Award className="w-6 h-6 text-sky-600 mb-1" />
                <span className="text-[11px] font-extrabold uppercase tracking-widest">
                  {t.signatureStamp}
                </span>
                <span className="text-[10px] font-mono text-slate-600 mt-0.5">
                  {labConfig.accreditationNumber}
                </span>
                <span className="text-[9px] text-slate-400 mt-1">
                  Validé électroniquement le {result.validationTimestamp || result.detectionDate}
                </span>
              </div>

              {/* Biologist Signature */}
              <div className="flex flex-col justify-between text-xs">
                <div>
                  <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider block">
                    {t.biologistSignature}
                  </span>
                  <span className="font-semibold text-slate-800 block mt-1">
                    {result.validatedBy}
                  </span>
                  <span className="text-slate-500 text-[11px] block">
                    {labConfig.defaultRole}
                  </span>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>RPPS: 10098421890</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Certifié
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
