import { useState } from "react";
import {
  Hash, Ruler, Cloud, TrafficCone, Clock, Truck,
  ChefHat, Star, Loader2, Zap, RotateCcw, AlertTriangle,
  CheckCircle, MapPin,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────── Constants ─────────────────────────── */
const API_URL = "http://127.0.0.1:8000/predict";

const WEATHER_OPTIONS  = ["Sunny", "Cloudy", "Rainy", "Snowy", "Windy", "Foggy"];
const TRAFFIC_OPTIONS  = ["Low", "Medium", "High"];
const TIME_OPTIONS     = ["Morning", "Afternoon", "Evening", "Night"];
const VEHICLE_OPTIONS  = ["Bike", "Scooter", "Car", "Truck"];

const DEFAULT_FORM = {
  Order_ID:               "",
  Distance_km:            "",
  Weather:                "Sunny",
  Traffic_Level:          "Low",
  Time_of_Day:            "Morning",
  Vehicle_Type:           "Bike",
  Preparation_Time_min:   "",
  Courier_Experience_yrs: "",
};

/* ─────────────────────────── Mesh Background ───────────────────── */
function MeshBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[#030712]" />
      <div className="absolute animate-mesh"
        style={{ top: "-20%", left: "-15%", width: "60%", height: "60%",
          background: "radial-gradient(ellipse, rgba(124,58,237,0.12) 0%, transparent 70%)", borderRadius: "50%" }} />
      <div className="absolute animate-mesh"
        style={{ bottom: "-25%", right: "-20%", width: "60%", height: "60%",
          background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, transparent 70%)", borderRadius: "50%", animationDelay: "-5s" }} />
      <div className="absolute inset-0 opacity-[0.025]"
        style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_50%,_#030712_100%)]" />
    </div>
  );
}

/* ─────────────────────────── Input Field ───────────────────────── */
function FloatInput({ id, label, icon: Icon, value, onChange, ...props }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        <Icon className={`w-4 h-4 transition-colors ${value !== "" ? "text-violet-400" : "text-slate-500"}`} />
      </div>
      <input
        id={id}
        value={value}
        onChange={onChange}
        placeholder=" "
        {...props}
        className="peer w-full input-glass rounded-xl pl-11 pr-4 pt-6 pb-2 text-sm text-white font-medium"
      />
      <label htmlFor={id}
        className="absolute left-11 top-4 text-xs text-slate-500 font-medium pointer-events-none transition-all duration-200
          peer-focus:top-2 peer-focus:text-[10px] peer-focus:text-violet-400
          peer-not-placeholder-shown:top-2 peer-not-placeholder-shown:text-[10px] peer-not-placeholder-shown:text-slate-400">
        {label}
      </label>
    </div>
  );
}

/* ─────────────────────────── Select Field ──────────────────────── */
function GlassSelect({ id, label, icon: Icon, value, onChange, options }) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none z-10">
        <Icon className="w-4 h-4 text-violet-400" />
      </div>
      <select id={id} value={value} onChange={onChange}
        className="peer w-full select-glass input-glass rounded-xl pl-11 pr-10 pt-6 pb-2 text-sm text-white font-medium cursor-pointer">
        {options.map(o => <option key={o} value={o} className="bg-slate-900">{o}</option>)}
      </select>
      <label htmlFor={id}
        className="absolute left-11 top-2 text-[10px] text-slate-400 font-medium pointer-events-none tracking-wide">
        {label}
      </label>
      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}

/* ─────────────────────────── Circular Progress ─────────────────── */
function ProgressRing({ pct, size = 120, stroke = 9, color = "#7C3AED" }) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
        strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
        transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        style={{ filter: `drop-shadow(0 0 8px ${color}80)` }}
      />
    </svg>
  );
}

/* ─────────────────────────── Main App ──────────────────────────── */
export default function App() {
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const handleChange = field => e => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleReset = () => { setForm(DEFAULT_FORM); setResult(null); setError(null); };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setResult(null); setError(null);

    const payload = {
      Order_ID:               parseInt(form.Order_ID, 10),
      Distance_km:            parseFloat(form.Distance_km),
      Weather:                form.Weather,
      Traffic_Level:          form.Traffic_Level,
      Time_of_Day:            form.Time_of_Day,
      Vehicle_Type:           form.Vehicle_Type,
      Preparation_Time_min:   parseFloat(form.Preparation_Time_min),
      Courier_Experience_yrs: parseFloat(form.Courier_Experience_yrs),
    };

    try {
      const res  = await fetch(API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error(`Server error: ${res.status} ${res.statusText}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.predicted_delivery_time_min);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const mins = result !== null ? Math.floor(result) : null;
  const secs = result !== null ? Math.round((result % 1) * 60) : null;
  const pct  = result !== null ? Math.min(Math.round((result / 90) * 100), 100) : 0;

  const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };
  const item    = { hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <>
      <MeshBackground />
      <div className="relative min-h-screen text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

          {/* ── Hero ── */}
          <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
            className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/20 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              <span className="text-xs font-semibold text-slate-300 tracking-widest uppercase">ML Model Active</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4">
              <span className="text-white">Food Delivery</span>{" "}
              <span className="text-shimmer">ETA</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Enter order details to get an instant delivery time prediction.
            </p>
          </motion.div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* LEFT: Form */}
            <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.55, delay:0.15 }}
              className="glass-strong rounded-3xl overflow-hidden">

              {/* Card header */}
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-sm font-bold text-white">Order Details</span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <motion.div variants={stagger} initial="hidden" animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <motion.div variants={item}>
                    <FloatInput id="Order_ID" label="Order ID" icon={Hash}
                      type="number" step="1" min="1"
                      value={form.Order_ID} onChange={handleChange("Order_ID")} required />
                  </motion.div>

                  <motion.div variants={item}>
                    <FloatInput id="Distance_km" label="Distance (km)" icon={Ruler}
                      type="number" step="0.1" min="0"
                      value={form.Distance_km} onChange={handleChange("Distance_km")} required />
                  </motion.div>

                  <motion.div variants={item}>
                    <GlassSelect id="Weather" label="Weather" icon={Cloud}
                      value={form.Weather} onChange={handleChange("Weather")} options={WEATHER_OPTIONS} />
                  </motion.div>

                  <motion.div variants={item}>
                    <GlassSelect id="Traffic_Level" label="Traffic Level" icon={TrafficCone}
                      value={form.Traffic_Level} onChange={handleChange("Traffic_Level")} options={TRAFFIC_OPTIONS} />
                  </motion.div>

                  <motion.div variants={item}>
                    <GlassSelect id="Time_of_Day" label="Time of Day" icon={Clock}
                      value={form.Time_of_Day} onChange={handleChange("Time_of_Day")} options={TIME_OPTIONS} />
                  </motion.div>

                  <motion.div variants={item}>
                    <GlassSelect id="Vehicle_Type" label="Vehicle Type" icon={Truck}
                      value={form.Vehicle_Type} onChange={handleChange("Vehicle_Type")} options={VEHICLE_OPTIONS} />
                  </motion.div>

                  <motion.div variants={item}>
                    <FloatInput id="Preparation_Time_min" label="Prep Time (min)" icon={ChefHat}
                      type="number" step="0.5" min="0"
                      value={form.Preparation_Time_min} onChange={handleChange("Preparation_Time_min")} required />
                  </motion.div>

                  <motion.div variants={item}>
                    <FloatInput id="Courier_Experience_yrs" label="Courier Experience (yrs)" icon={Star}
                      type="number" step="0.5" min="0"
                      value={form.Courier_Experience_yrs} onChange={handleChange("Courier_Experience_yrs")} required />
                  </motion.div>
                </motion.div>

                {/* Buttons */}
                <div className="flex gap-3 mt-6">
                  <motion.button
                    type="submit" disabled={loading}
                    whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                    whileTap={!loading ? { scale: 0.98 } : {}}
                    className="flex-1 py-3.5 px-5 rounded-xl font-bold text-sm text-white
                      bg-gradient-to-r from-violet-600 to-indigo-500
                      hover:shadow-[0_0_28px_rgba(124,58,237,0.45)]
                      disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300
                      flex items-center justify-center gap-2">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Predicting…</span></>
                      : <><Zap className="w-4 h-4" /><span>Predict Delivery Time</span></>}
                  </motion.button>
                  <motion.button
                    type="button" onClick={handleReset}
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    className="px-4 py-3.5 rounded-xl text-slate-400 hover:text-white glass border border-white/10 hover:border-white/20 transition-all">
                    <RotateCcw className="w-4 h-4" />
                  </motion.button>
                </div>
              </form>
            </motion.div>

            {/* RIGHT: Result */}
            <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ duration:0.55, delay:0.25 }}
              className="glass-strong rounded-3xl overflow-hidden">

              {/* Card header */}
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm font-bold text-white">ETA Result</span>
                </div>
                <AnimatePresence>
                  {result !== null && (
                    <motion.div initial={{ opacity:0, scale:0 }} animate={{ opacity:1, scale:1 }}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs font-semibold text-green-400">Success</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="p-6 min-h-72 flex flex-col justify-center">
                <AnimatePresence mode="wait">

                  {/* Loading */}
                  {loading && (
                    <motion.div key="loading" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      className="flex flex-col items-center gap-5">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 rounded-full border-4 border-violet-500/20 animate-spin border-t-violet-500" />
                        <div className="absolute inset-3 rounded-full border-4 border-blue-500/20 animate-spin border-t-blue-500"
                          style={{ animationDuration:"1.5s", animationDirection:"reverse" }} />
                      </div>
                      <p className="text-slate-400 text-sm animate-pulse">Running prediction…</p>
                    </motion.div>
                  )}

                  {/* Error */}
                  {error && !loading && (
                    <motion.div key="error" initial={{ opacity:0, scale:0.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
                      className="flex flex-col items-center gap-5 text-center">
                      <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
                        <AlertTriangle className="w-7 h-7 text-red-400" />
                      </div>
                      <div>
                        <p className="font-bold text-red-400 mb-2">Prediction Failed</p>
                        <p className="text-red-300/60 text-sm font-mono bg-red-950/30 border border-red-500/20 rounded-lg px-4 py-2 break-all">
                          {error}
                        </p>
                      </div>
                      <motion.button onClick={() => { setError(null); setResult(null); }}
                        whileHover={{ scale:1.05 }} whileTap={{ scale:0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm font-semibold hover:bg-red-500/20 transition-all">
                        <RotateCcw className="w-3.5 h-3.5" /> Try Again
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Waiting */}
                  {result === null && !loading && !error && (
                    <motion.div key="waiting" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
                      className="flex flex-col items-center gap-4 text-center">
                      <div className="w-16 h-16 rounded-full glass border border-violet-500/20 flex items-center justify-center animate-float">
                        <Clock className="w-7 h-7 text-violet-500/60" />
                      </div>
                      <div>
                        <p className="text-slate-400 font-semibold">Awaiting Prediction</p>
                        <p className="text-slate-600 text-sm mt-1">Fill the form and click predict</p>
                      </div>
                    </motion.div>
                  )}

                  {/* Result */}
                  {result !== null && !loading && !error && (
                    <motion.div key="result" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                      transition={{ duration:0.45 }} className="flex flex-col gap-6">

                      {/* Ring + ETA */}
                      <div className="flex items-center gap-6">
                        <div className="relative flex-shrink-0">
                          <ProgressRing pct={pct} size={120} stroke={9} color="#7C3AED" />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-black text-white leading-none">{mins}</span>
                            <span className="text-xs text-slate-500">min</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Estimated Delivery Time</p>
                          <div className="flex items-end gap-1.5">
                            <motion.span initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
                              className="text-5xl font-black text-white leading-none">{mins}</motion.span>
                            <span className="text-slate-400 font-semibold mb-1 text-lg">min</span>
                            <motion.span initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
                              className="text-2xl font-bold text-slate-300 leading-none">{String(secs).padStart(2,"0")}</motion.span>
                            <span className="text-slate-500 text-xs mb-1">sec</span>
                          </div>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="glass rounded-xl px-4 py-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest">Scale (0 – 90 min)</span>
                          <span className="text-xs text-violet-400 font-semibold">{pct}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                          <motion.div initial={{ width:0 }} animate={{ width:`${pct}%` }}
                            transition={{ duration:1.2, delay:0.4, ease:"easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-blue-500"
                            style={{ boxShadow:"0 0 10px rgba(124,58,237,0.55)" }} />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-slate-600">
                          <span>0</span><span>45 min</span><span>90 min</span>
                        </div>
                      </div>

                      {/* Raw value */}
                      <p className="text-center text-[11px] text-slate-600 font-mono">
                        Raw: <span className="text-slate-400">{result.toFixed(4)} min</span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* ── Footer ── */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
            className="mt-8 glass rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-slate-400 font-mono">API: http://127.0.0.1:8000</span>
            </div>
            <span className="text-xs text-slate-600">POST /predict · FastAPI + ML Model</span>
          </motion.div>

        </div>
      </div>
    </>
  );
}
