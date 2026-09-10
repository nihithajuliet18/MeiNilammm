import React, { useState } from 'react';
import { ModelAnalysis } from '../types';
import { Zap, Loader2, AlertTriangle, Check } from 'lucide-react';

interface ModelAnalysisDashboardProps {
  applicationId: string;
}

export const ModelAnalysisDashboard: React.FC<ModelAnalysisDashboardProps> = ({ applicationId }) => {
  const [analysis, setAnalysis] = useState<ModelAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const res = await fetch(`/api/cases/${applicationId}/model-analysis`, { method: 'POST' });
      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setAnalysis(data);
    } catch (err) {
      setError('Failed to run model analysis. Ensure the Python service is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderResult = (res: any) => {
    if (res.multiParcel) {
      return (
        <div className="space-y-4">
          {res.multiParcel.map((p: any) => (
            <div key={p.parcelId} className="p-4 border rounded-lg">
              <h4 className="font-bold text-xs">Parcel {p.parcelId}</h4>
              {p.error ? <span className="text-rose-500">{p.error}</span> : renderResultContent(p.result)}
            </div>
          ))}
        </div>
      );
    }
    return renderResultContent(res);
  };

  const renderResultContent = (res: any) => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-[10px] text-slate-400">Predicted Class</div>
          <div className="text-sm font-bold">{res.predicted_class}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-[10px] text-slate-400">Confidence (Prob)</div>
          <div className="text-sm font-bold">{(res.uncalibrated_model_probability * 100).toFixed(1)}%</div>
        </div>
      </div>
      
      <h4 className="text-xs font-bold mt-4">Top Drivers (SHAP)</h4>
      <div className="space-y-2">
        {res.top_model_drivers.map((driver: any, i: number) => (
          <div key={i} className="flex justify-between text-xs p-2 border-b">
            <span>{driver.feature}</span>
            <span className="font-mono font-bold">{driver.shap_raw_score.toFixed(3)}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <Zap className="w-4 h-4 text-emerald-600" />
          <span>Model Analysis (Synthetic-trained prototype)</span>
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          This model was trained entirely on synthetic tabular data. Its outputs are for demonstrative purposes and should not be used to approve applications, authenticate identity, declare fraud, or reconstruct an FMB image.
        </p>

        <button
          onClick={runAnalysis}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 hover:bg-emerald-800 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>Run Model Analysis</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-800 rounded-lg text-xs border border-rose-200 flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {analysis && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold">Analysis Results (v{analysis.modelVersion})</h3>
          {renderResult(analysis.result)}
        </div>
      )}
    </div>
  );
};
