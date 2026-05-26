import { useState } from "react";
import {
  User, ChevronRight, Bell, AlertTriangle, ArrowLeft, WifiOff,
  Plus, Thermometer, Timer, Activity, BarChart2,
  Camera, Check, Edit, Trash2, CheckCircle2, Home,
} from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────────

type Screen =
  | "home" | "profile-select" | "profile-edit"
  | "dashboard" | "health-report" | "warnings"
  | "analysis" | "odor" | "sitz-bath" | "posture";

type NavTab = "home" | "analysis" | "report" | "alerts";
type Grade = "excellent" | "good" | "normal" | "bad" | "hospital";

interface Profile {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  conditions: string[];
  emoji: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CONDITIONS = ["고혈압", "당뇨병", "치질", "변비", "과민성장증후군", "신장질환", "소화불량"];
const EMOJIS = ["👨", "👩", "👴", "👵", "🧑", "👦", "👧"];

const GRADES: Record<Grade, { label: string; color: string; bg: string; border: string; dot: string }> = {
  excellent: { label: "매우 좋음", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300", dot: "bg-emerald-500" },
  good:      { label: "좋음",      color: "text-teal-700",    bg: "bg-teal-50",    border: "border-teal-300",    dot: "bg-teal-500"    },
  normal:    { label: "평범",      color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-300",   dot: "bg-amber-500"   },
  bad:       { label: "나쁨",      color: "text-orange-700",  bg: "bg-orange-50",  border: "border-orange-300",  dot: "bg-orange-500"  },
  hospital:  { label: "병원 필요", color: "text-red-700",     bg: "bg-red-50",     border: "border-red-300",     dot: "bg-red-500"     },
};

const SCORE_COLORS: Record<number, string> = { 1: "#ef4444", 2: "#f97316", 3: "#f59e0b", 4: "#14b8a6", 5: "#10b981" };

// ── Mock data ──────────────────────────────────────────────────────────────

const initialProfiles: Profile[] = [
  { id: "1", name: "김민준", age: 35, height: 178, weight: 74, conditions: ["고혈압"], emoji: "👨" },
  { id: "2", name: "이서연", age: 28, height: 163, weight: 56, conditions: [], emoji: "👩" },
];

const bananaRecords = [
  { date: "2026.05.26", time: "07:32", grade: "good" as Grade, color: "갈색", shape: "4형 (소시지형)", note: "정상 범위" },
  { date: "2026.05.25", time: "08:15", grade: "normal" as Grade, color: "연갈색", shape: "5형 (부드러운 덩어리)", note: "수분 섭취 권장" },
  { date: "2026.05.24", time: "07:55", grade: "hospital" as Grade, color: "어두운 갈색", shape: "1형 (딱딱한 덩어리)", note: "탈수 의심 — 병원 방문 권장" },
  { date: "2026.05.23", time: "09:20", grade: "good" as Grade, color: "갈색", shape: "3형 (소시지 모양)", note: "정상" },
  { date: "2026.05.22", time: "07:48", grade: "normal" as Grade, color: "황갈색", shape: "6형 (흐트러진 조각)", note: "식이 조절 권장" },
];

const urineRecords = [
  { date: "2026.05.26", time: "07:30", color: "연노란색", grade: "good" as Grade, frequency: 6, note: "정상" },
  { date: "2026.05.25", time: "08:00", color: "진한 노란색", grade: "normal" as Grade, frequency: 4, note: "수분 부족 가능" },
  { date: "2026.05.24", time: "07:50", color: "짙은 노란색", grade: "bad" as Grade, frequency: 3, note: "탈수 주의" },
  { date: "2026.05.23", time: "09:10", color: "연노란색", grade: "good" as Grade, frequency: 7, note: "정상" },
];

const weeklyData = [
  { day: "월", score: 4, urine: 6 },
  { day: "화", score: 3, urine: 7 },
  { day: "수", score: 5, urine: 5 },
  { day: "목", score: 1, urine: 8 },
  { day: "금", score: 4, urine: 6 },
  { day: "토", score: 5, urine: 7 },
  { day: "일", score: 3, urine: 6 },
];

const warningList = [
  { id: 1, date: "2026.05.24", severity: "critical", title: "이상 배변 감지", desc: "딱딱하고 어두운 색상의 배변이 감지되었습니다. 탈수 또는 장 문제 가능성이 있습니다.", icon: "🍌" },
  { id: 2, date: "2026.05.20", severity: "warning", title: "악취 고농도 감지", desc: "평소보다 3배 높은 악취 수치가 감지되었습니다. 소화 기능을 점검해 주세요.", icon: "💨" },
  { id: 3, date: "2026.05.15", severity: "info", title: "소변 색상 변화", desc: "소변 색상이 진한 황색으로 변화했습니다. 충분한 수분 섭취를 권장합니다.", icon: "💧" },
  { id: 4, date: "2026.05.10", severity: "info", title: "배변 주기 불규칙", desc: "3일 이상 배변이 감지되지 않았습니다. 식이섬유 섭취를 늘려보세요.", icon: "📊" },
];

// ── Shared Components ──────────────────────────────────────────────────────

function GradeBadge({ grade }: { grade: Grade }) {
  const g = GRADES[grade];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${g.bg} ${g.color} ${g.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${g.dot}`} />
      {g.label}
    </span>
  );
}

function PageHeader({
  title, onBack, right,
}: {
  title: string; onBack?: () => void; right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center px-4 py-4 bg-white border-b border-border sticky top-0 z-10">
      {onBack && (
        <button onClick={onBack} className="mr-3 p-1.5 rounded-full hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
      )}
      <h1 className="flex-1 text-[15px] font-bold text-foreground">{title}</h1>
      {right}
    </div>
  );
}

// ── Home Screen ────────────────────────────────────────────────────────────

function HomeScreen({ onSelectProfile }: { onSelectProfile: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden">
      <div className="absolute inset-0 bg-slate-700">
        <img
          src="https://images.unsplash.com/photo-1611066415697-7f58dc0a5d10?w=860&h=1200&fit=crop&auto=format"
          alt="깨끗한 현대식 욕실"
          className="w-full h-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/40 via-transparent to-slate-900/80" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top badge */}
        <div className="pt-14 px-6">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/20 px-4 py-2 rounded-full">
            <span className="text-xl">🚽</span>
            <span className="text-white font-bold text-sm tracking-widest">SMART 변기</span>
          </div>
        </div>

        {/* Hero copy */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-4">
          <p className="text-cyan-200 text-sm font-medium mb-3 tracking-wide">AI 헬스케어 스마트 변기</p>
          <h1 className="text-white text-[2.2rem] font-extrabold leading-tight mb-4">
            당신의 건강을<br />변기가 지킵니다
          </h1>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            배변·소변 분석부터 악취 관리, 좌욕 케어까지
            <br />AI가 건강을 실시간으로 모니터링합니다
          </p>

          <div className="flex gap-3 mt-8">
            {[
              { icon: "🍌", label: "배변 분석" },
              { icon: "💧", label: "소변 분석" },
              { icon: "💨", label: "악취 관리" },
              { icon: "🛁", label: "좌욕 케어" },
            ].map(f => (
              <div key={f.label} className="flex flex-col items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded-2xl px-3 py-2.5 flex-1">
                <span className="text-lg">{f.icon}</span>
                <span className="text-white/70 text-[10px] font-medium text-center">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="pb-12 px-6">
          <button
            onClick={onSelectProfile}
            className="w-full bg-white text-primary font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-2xl active:scale-[0.98] transition-transform"
          >
            <User className="w-5 h-5" />
            사용자 선택 · 시작하기
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-white/40 text-center text-xs mt-3">
            프로필을 선택하면 맞춤형 케어가 시작됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Profile Select Screen ──────────────────────────────────────────────────

function ProfileSelectScreen({
  profiles, onSelect, onEdit, onAdd, onBack, onDelete,
}: {
  profiles: Profile[];
  onSelect: (p: Profile) => void;
  onEdit: (p: Profile) => void;
  onAdd: () => void;
  onBack: () => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader title="사용자 선택" onBack={onBack} />

      <div className="flex-1 px-4 py-6 space-y-3">
        <p className="text-xs text-muted-foreground px-1 mb-4">
          프로필을 선택하면 AI가 맞춤형 분석을 시작합니다
        </p>

        {profiles.map(p => (
          <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden">
            <button
              onClick={() => onSelect(p)}
              className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 active:bg-muted/60 transition-colors"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                {p.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-foreground text-base">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {p.age}세 · {p.height}cm · {p.weight}kg
                </div>
                {p.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {p.conditions.map(c => (
                      <span key={c} className="text-[10px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-100 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </button>

            <div className="flex border-t border-border">
              <button
                onClick={() => onEdit(p)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" /> 프로필 수정
              </button>
              <div className="w-px bg-border" />
              <button
                onClick={() => onDelete(p.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> 삭제
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={onAdd}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-primary/30 text-primary flex items-center justify-center gap-2 font-semibold hover:bg-primary/5 active:bg-primary/10 transition-colors"
        >
          <Plus className="w-5 h-5" /> 새 프로필 추가
        </button>
      </div>
    </div>
  );
}

// ── Profile Edit Screen ────────────────────────────────────────────────────

function ProfileEditScreen({
  profile, onSave, onBack,
}: {
  profile: Profile | null;
  onSave: (p: Profile) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(profile?.age?.toString() ?? "");
  const [height, setHeight] = useState(profile?.height?.toString() ?? "");
  const [weight, setWeight] = useState(profile?.weight?.toString() ?? "");
  const [conditions, setConditions] = useState<string[]>(profile?.conditions ?? []);
  const [emoji, setEmoji] = useState(profile?.emoji ?? "👤");

  const toggle = (c: string) =>
    setConditions(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      id: profile?.id ?? Date.now().toString(),
      name: name.trim(),
      age: parseInt(age) || 0,
      height: parseInt(height) || 0,
      weight: parseInt(weight) || 0,
      conditions,
      emoji,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PageHeader title={profile ? "프로필 수정" : "새 프로필"} onBack={onBack} />

      <div className="flex-1 px-4 py-6 space-y-4">

        {/* Avatar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">아이콘</p>
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-12 h-12 rounded-full text-2xl flex items-center justify-center border-2 transition-all ${
                  emoji === e ? "border-primary bg-primary/10 scale-110" : "border-transparent bg-muted"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Basic info */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">기본 정보</p>

          <div>
            <label className="text-xs text-muted-foreground block mb-1.5">이름</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full bg-muted rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "나이 (세)", val: age, set: setAge, ph: "35" },
              { label: "키 (cm)", val: height, set: setHeight, ph: "170" },
              { label: "몸무게 (kg)", val: weight, set: setWeight, ph: "65" },
            ].map(f => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground block mb-1.5">{f.label}</label>
                <input
                  type="number"
                  value={f.val}
                  onChange={e => f.set(e.target.value)}
                  placeholder={f.ph}
                  className="w-full bg-muted rounded-xl px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">보유 질환</p>
          <div className="flex flex-wrap gap-2">
            {CONDITIONS.map(c => {
              const active = conditions.includes(c);
              return (
                <button
                  key={c}
                  onClick={() => toggle(c)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    active
                      ? "bg-primary text-white border-primary shadow-sm"
                      : "bg-muted text-muted-foreground border-transparent hover:border-primary/30"
                  }`}
                >
                  {active && <Check className="w-3 h-3 inline mr-1" />}
                  {c}
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full bg-primary text-white font-bold py-4 rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-all shadow-lg shadow-primary/25"
        >
          저장하기
        </button>
      </div>
    </div>
  );
}

// ── Dashboard Screen ───────────────────────────────────────────────────────

function DashboardScreen({
  profile, onNavigate, onProfileSelect,
}: {
  profile: Profile;
  onNavigate: (s: Screen) => void;
  onProfileSelect: () => void;
}) {
  const features = [
    { icon: "🍌", title: "바나나 분석", desc: "배변·소변 상태", grad: "from-amber-400 to-orange-400", screen: "analysis" as Screen },
    { icon: "📊", title: "건강 리포트", desc: "주간 건강 데이터", grad: "from-violet-400 to-purple-500", screen: "health-report" as Screen },
    { icon: "💨", title: "악취 · 필터", desc: "악취 분석 및 필터", grad: "from-teal-400 to-cyan-500", screen: "odor" as Screen },
    { icon: "🛁", title: "좌욕 기능", desc: "치질 케어 온수 좌욕", grad: "from-sky-400 to-blue-500", screen: "sitz-bath" as Screen },
    { icon: "🦵", title: "자세 가이드", desc: "최적 배변 자세", grad: "from-indigo-400 to-violet-500", screen: "posture" as Screen },
    { icon: "⚠️", title: "경고 내역", desc: "이상 징후 알림", grad: "from-red-400 to-rose-500", screen: "warnings" as Screen },
  ];

  return (
    <div className="min-h-screen bg-[#EEF7FA]">

      {/* Header */}
      <div className="bg-white pt-12 pb-4 px-4 border-b border-border">
        <div className="flex items-center justify-between">
          <button onClick={onProfileSelect} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
              {profile.emoji}
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground">안녕하세요</p>
              <p className="text-sm font-bold text-foreground flex items-center gap-0.5">
                {profile.name} <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
              </p>
            </div>
          </button>
          <button
            onClick={() => onNavigate("warnings")}
            className="relative p-2.5 rounded-full hover:bg-muted transition-colors"
          >
            <Bell className="w-5 h-5 text-foreground" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* AI Status Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <WifiOff className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-amber-800 text-sm">카메라 · 센서 연결 안됨</p>
            <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
              AI 자동 분석 기능이 비활성화 상태입니다.
              변기 하드웨어 연결 후 자동 분석이 시작됩니다.
            </p>
          </div>
          <Camera className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
        </div>

        {/* Today Summary */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-foreground text-sm">오늘의 건강 요약</p>
            <span className="text-xs text-muted-foreground">2026.05.26</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "🍌", label: "배변 상태", grade: "good" as Grade },
              { icon: "💧", label: "소변 상태", grade: "normal" as Grade },
              { icon: "💨", label: "악취 수준", special: true },
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 bg-muted/50 rounded-2xl py-3 px-2">
                <span className="text-2xl">{item.icon}</span>
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                {item.grade ? (
                  <GradeBadge grade={item.grade} />
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border bg-green-50 text-green-700 border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> 낮음
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "오늘 배변", value: "1회", icon: "🍌", bg: "bg-amber-50 border-amber-100" },
            { label: "오늘 소변", value: "4회", icon: "💧", bg: "bg-blue-50 border-blue-100" },
            { label: "악취 레벨", value: "23%", icon: "💨", bg: "bg-teal-50 border-teal-100" },
          ].map(s => (
            <div key={s.label} className={`rounded-2xl p-3.5 border ${s.bg}`}>
              <div className="text-xl mb-1">{s.icon}</div>
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Feature Grid */}
        <div>
          <p className="font-bold text-foreground text-sm mb-3">기능 메뉴</p>
          <div className="grid grid-cols-2 gap-3">
            {features.map(f => (
              <button
                key={f.title}
                onClick={() => onNavigate(f.screen)}
                className="bg-white rounded-2xl p-4 shadow-sm border border-border text-left active:scale-[0.97] transition-all hover:shadow-md"
              >
                <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${f.grad} flex items-center justify-center text-xl mb-3 shadow-sm`}>
                  {f.icon}
                </div>
                <p className="font-bold text-foreground text-sm">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Analysis Screen (Banana + Urine) ──────────────────────────────────────

function AnalysisScreen({ onBack }: { onBack: () => void }) {
  const [tab, setTab] = useState<"banana" | "urine">("banana");

  return (
    <div className="min-h-screen bg-[#EEF7FA]">
      <PageHeader title="배변 · 소변 분석" onBack={onBack} />

      {/* Tabs */}
      <div className="bg-white border-b border-border">
        <div className="flex">
          {[
            { key: "banana" as const, label: "🍌 바나나 (배변)" },
            { key: "urine" as const, label: "💧 소변" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 py-3.5 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">

        {/* Status notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center gap-3">
          <Camera className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <p className="text-xs text-slate-500">AI 카메라 미연결 — 수동 기록만 가능합니다</p>
        </div>

        {tab === "banana" && (
          <>
            {/* Bristol scale quick ref */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
              <p className="font-bold text-sm text-foreground mb-3">브리스톨 척도 참고</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { t: "1형", d: "딱딱한 덩어리", g: "hospital" as Grade },
                  { t: "2형", d: "울퉁불퉁 소시지", g: "bad" as Grade },
                  { t: "3형", d: "균열 소시지형", g: "normal" as Grade },
                  { t: "4형 ✓", d: "부드러운 소시지", g: "good" as Grade },
                  { t: "5형", d: "부드러운 덩어리", g: "normal" as Grade },
                  { t: "6형", d: "흐트러진 조각", g: "bad" as Grade },
                  { t: "7형", d: "물처럼 흐름", g: "hospital" as Grade },
                ].map(r => (
                  <div key={r.t} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground w-10 flex-shrink-0">{r.t}</span>
                    <GradeBadge grade={r.g} />
                  </div>
                ))}
              </div>
            </div>

            {/* Records */}
            <div className="space-y-3">
              {bananaRecords.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🍌</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{r.date}</p>
                        <p className="text-[10px] text-muted-foreground">{r.time}</p>
                      </div>
                    </div>
                    <GradeBadge grade={r.grade} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-muted rounded-xl px-3 py-2">
                      <p className="text-[10px] text-muted-foreground">색상</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{r.color}</p>
                    </div>
                    <div className="bg-muted rounded-xl px-3 py-2">
                      <p className="text-[10px] text-muted-foreground">형태</p>
                      <p className="text-xs font-semibold text-foreground mt-0.5">{r.shape}</p>
                    </div>
                  </div>
                  {r.grade === "hospital" && (
                    <div className="mt-2 flex items-center gap-2 bg-red-50 rounded-xl px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                      <span className="text-xs text-red-600 font-medium">{r.note}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "urine" && (
          <div className="space-y-3">
            {/* Urine color guide */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
              <p className="font-bold text-sm text-foreground mb-3">소변 색상 가이드</p>
              <div className="space-y-2">
                {[
                  { color: "무색 투명", desc: "수분 과다", g: "normal" as Grade },
                  { color: "연노란색", desc: "정상 (최적)", g: "good" as Grade },
                  { color: "진한 노란색", desc: "수분 부족", g: "normal" as Grade },
                  { color: "주황/갈색", desc: "탈수 주의", g: "bad" as Grade },
                  { color: "분홍/빨간색", desc: "혈뇨 — 즉시 병원", g: "hospital" as Grade },
                ].map(r => (
                  <div key={r.color} className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-foreground">{r.color}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{r.desc}</span>
                    </div>
                    <GradeBadge grade={r.g} />
                  </div>
                ))}
              </div>
            </div>

            {urineRecords.map((r, i) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💧</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{r.date}</p>
                      <p className="text-[10px] text-muted-foreground">일 {r.frequency}회</p>
                    </div>
                  </div>
                  <GradeBadge grade={r.grade} />
                </div>
                <div className="bg-muted rounded-xl px-3 py-2">
                  <p className="text-[10px] text-muted-foreground">색상</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5">{r.color}</p>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">{r.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Health Report Screen ───────────────────────────────────────────────────

function HealthReportScreen({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-[#EEF7FA]">
      <PageHeader title="건강 리포트" onBack={onBack} />

      <div className="px-4 py-5 space-y-4">

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "배변 주간 평균", value: "3.6점", sub: "평균 이상", color: "text-teal-700", bg: "bg-teal-50 border-teal-100" },
            { label: "소변 일평균", value: "6.4회", sub: "정상 (6~8회)", color: "text-blue-700", bg: "bg-blue-50 border-blue-100" },
            { label: "이번 달 경고", value: "4건", sub: "전달 대비 −2건", color: "text-amber-700", bg: "bg-amber-50 border-amber-100" },
            { label: "건강 종합 점수", value: "72점", sub: "양호 수준", color: "text-violet-700", bg: "bg-violet-50 border-violet-100" },
          ].map(c => (
            <div key={c.label} className={`${c.bg} border rounded-2xl p-4`}>
              <p className={`text-2xl font-extrabold ${c.color}`}>{c.value}</p>
              <p className={`font-semibold text-xs ${c.color} mt-0.5`}>{c.label}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>

        {/* Weekly banana scores */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <p className="font-bold text-foreground text-sm mb-1">이번 주 바나나 상태 점수</p>
          <p className="text-[10px] text-muted-foreground mb-4">5점 = 매우 좋음 · 1점 = 병원 필요</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={weeklyData} barSize={30}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 5]} tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={20} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: "12px" }}
                formatter={(v: number) => {
                  const labels: Record<number, string> = { 1: "병원 필요", 2: "나쁨", 3: "평범", 4: "좋음", 5: "매우 좋음" };
                  return [labels[v] ?? v, "상태"];
                }}
              />
              <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                {weeklyData.map((d, i) => (
                  <Cell key={i} fill={SCORE_COLORS[d.score] ?? "#0891b2"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly urine frequency */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <p className="font-bold text-foreground text-sm mb-4">이번 주 소변 횟수</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={20} />
              <Tooltip
                contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)", fontSize: "12px" }}
                formatter={(v: number) => [`${v}회`, "소변 횟수"]}
              />
              <Line type="monotone" dataKey="urine" stroke="#0891b2" strokeWidth={2.5} dot={{ fill: "#0891b2", r: 4, strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* AI health interpretation */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4">
          <p className="font-bold text-primary text-sm mb-2">🤖 AI 건강 해석</p>
          <p className="text-xs text-foreground/70 leading-relaxed">
            이번 주 목요일 배변 상태가 <span className="text-red-600 font-semibold">병원 필요</span> 수준으로 감지되었습니다.
            전반적인 수분 섭취량이 부족해 보이며, 소변 빈도 증가와 함께 장 건강 개선이 필요합니다.
            식이섬유가 풍부한 식단과 하루 2L 이상 수분 섭취를 권장합니다.
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <WifiOff className="w-3 h-3" />
            <span>AI 카메라 미연결 — 저장된 수동 기록 기반 분석</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Odor & Filter Screen ───────────────────────────────────────────────────

function OdorScreen({ onBack }: { onBack: () => void }) {
  const odorLevel = 23;
  const filterCapacity = 68;
  const odorColor = odorLevel < 30 ? "#10b981" : odorLevel < 60 ? "#f59e0b" : "#ef4444";
  const filterColor = filterCapacity > 50 ? "#10b981" : filterCapacity > 20 ? "#f59e0b" : "#ef4444";
  const r = 48;
  const circ = 2 * Math.PI * r;

  return (
    <div className="min-h-screen bg-[#EEF7FA]">
      <PageHeader title="악취 분석 · 필터 관리" onBack={onBack} />

      <div className="px-4 py-5 space-y-4">

        {/* Odor level */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <p className="font-bold text-foreground text-sm mb-4">현재 악취 수준</p>
          <div className="flex items-center gap-5">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                <circle cx="60" cy="60" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r={r} fill="none"
                  stroke={odorColor} strokeWidth="12"
                  strokeDasharray={`${circ}`}
                  strokeDashoffset={`${circ * (1 - odorLevel / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold" style={{ color: odorColor }}>{odorLevel}%</span>
                <span className="text-[10px] text-muted-foreground">악취 레벨</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xl font-bold text-green-600 mb-1">낮음</p>
              <p className="text-xs text-foreground mb-3">현재 악취 수준은 안전 범위입니다</p>
              <div className="space-y-1.5">
                {[
                  { label: "황화수소 H₂S", val: "0.2 ppm" },
                  { label: "암모니아 NH₃", val: "1.4 ppm" },
                  { label: "메탄 CH₄", val: "0.8 ppm" },
                ].map(item => (
                  <div key={item.label} className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-mono">{item.label}</span>
                    <span className="font-semibold text-foreground">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            <span className="text-xs text-green-700 font-medium">플라즈마 필터 정상 작동 중</span>
          </div>
        </div>

        {/* Filter capacity */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-foreground text-sm">플라즈마 필터 잔량</p>
            <span className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-semibold border border-green-200">
              정상
            </span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-muted-foreground">필터 잔량</span>
              <span className="font-bold" style={{ color: filterColor }}>{filterCapacity}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${filterCapacity}%`, backgroundColor: filterColor }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {[
              { label: "마지막 교체", val: "2026.02.10" },
              { label: "교체 권장일", val: "2026.08.10" },
              { label: "총 사용 시간", val: "1,248시간" },
              { label: "악취 분해량", val: "14,750건" },
            ].map(item => (
              <div key={item.label} className="bg-muted rounded-xl p-3">
                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">{item.val}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Health correlation */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <p className="font-bold text-sm text-foreground mb-3">악취 기반 건강 분석</p>
          <div className="space-y-2.5">
            {[
              { label: "소화 기능", status: "양호", color: "text-teal-600 bg-teal-50 border-teal-200" },
              { label: "장내 세균 균형", status: "보통", color: "text-amber-600 bg-amber-50 border-amber-200" },
              { label: "단백질 대사", status: "양호", color: "text-teal-600 bg-teal-50 border-teal-200" },
              { label: "탄수화물 발효", status: "양호", color: "text-teal-600 bg-teal-50 border-teal-200" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{item.label}</span>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${item.color}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Sitz Bath Screen ───────────────────────────────────────────────────────

function SitzBathScreen({
  on, setOn, temp, setTemp, duration, setDuration, onBack,
}: {
  on: boolean; setOn: (v: boolean) => void;
  temp: number; setTemp: (v: number) => void;
  duration: number; setDuration: (v: number) => void;
  onBack: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#EEF7FA]">
      <PageHeader title="좌욕 기능" onBack={onBack} />

      <div className="px-4 py-5 space-y-4">

        {/* Toggle */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground text-base">좌욕 시작 / 정지</p>
              <p className={`text-sm mt-0.5 ${on ? "text-cyan-600 font-medium" : "text-muted-foreground"}`}>
                {on ? "좌욕 실행 중..." : "대기 중"}
              </p>
            </div>
            <button
              onClick={() => setOn(!on)}
              className={`w-16 h-9 rounded-full transition-all relative flex-shrink-0 ${on ? "bg-cyan-500" : "bg-slate-200"}`}
            >
              <div className={`w-7 h-7 bg-white rounded-full shadow-md absolute top-1 transition-all duration-200 ${on ? "left-8" : "left-1"}`} />
            </button>
          </div>

          {on && (
            <div className="mt-4 flex items-center gap-2 bg-cyan-50 rounded-xl px-3 py-2.5 border border-cyan-200">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
              <span className="text-xs text-cyan-700 font-semibold">
                좌욕 진행 중 · {temp}°C · {duration}분
              </span>
            </div>
          )}
        </div>

        {/* Temperature */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-foreground flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-500" /> 수온 설정
            </p>
            <span className="text-2xl font-extrabold text-orange-500">{temp}°C</span>
          </div>
          <input
            type="range" min={35} max={42} step={1} value={temp}
            onChange={e => setTemp(parseInt(e.target.value))}
            className="w-full accent-orange-500 h-2 mb-3"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mb-3">
            <span>35°C (최소)</span>
            <span className="text-orange-500 font-semibold">권장 38–40°C</span>
            <span>42°C (최대)</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[36, 38, 40, 42].map(t => (
              <button
                key={t}
                onClick={() => setTemp(t)}
                className={`py-2 rounded-xl text-sm font-semibold transition-colors ${
                  temp === t ? "bg-orange-500 text-white shadow-sm" : "bg-muted text-muted-foreground"
                }`}
              >
                {t}°
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-4">
            <p className="font-bold text-foreground flex items-center gap-2">
              <Timer className="w-4 h-4 text-violet-500" /> 좌욕 시간
            </p>
            <span className="text-2xl font-extrabold text-violet-500">{duration}분</span>
          </div>
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => setDuration(d => Math.max(5, d - 5))}
              className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center text-3xl font-bold active:scale-95 transition-transform"
            >
              −
            </button>
            <span className="text-5xl font-extrabold text-foreground w-20 text-center tabular-nums">{duration}</span>
            <button
              onClick={() => setDuration(d => Math.min(30, d + 5))}
              className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center text-3xl font-bold active:scale-95 transition-transform"
            >
              +
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="bg-cyan-50 border border-cyan-200 rounded-2xl p-4">
          <p className="font-bold text-cyan-800 text-sm mb-2">💡 좌욕 효과 안내</p>
          <ul className="space-y-2">
            {[
              "항문 주변 혈류를 개선하여 치질 통증을 완화합니다",
              "온수 좌욕은 하루 2–3회, 10–15분이 권장됩니다",
              "온도는 38–40°C가 가장 효과적입니다",
              "사용자 상태에 따라 온도 및 시간을 자동 조절합니다",
            ].map(t => (
              <li key={t} className="flex items-start gap-2 text-xs text-cyan-700">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0 mt-1.5" />
                {t}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

// ── Posture Screen ─────────────────────────────────────────────────────────

function PostureScreen({ onBack }: { onBack: () => void }) {
  const [angle, setAngle] = useState(35);
  const [autoMode, setAutoMode] = useState(true);

  return (
    <div className="min-h-screen bg-[#EEF7FA]">
      <PageHeader title="최적 배변 자세" onBack={onBack} />

      <div className="px-4 py-5 space-y-4">

        {/* Visual guide */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-border">
          <p className="font-bold text-foreground text-sm mb-4">스마트 풋레스트 설정</p>

          {/* Illustration */}
          <div className="bg-indigo-50 rounded-2xl p-6 flex flex-col items-center mb-4">
            <svg width="200" height="180" viewBox="0 0 200 180" className="overflow-visible">
              {/* Toilet base */}
              <rect x="60" y="120" width="80" height="30" rx="8" fill="#e0e7ff" />
              <rect x="50" y="110" width="100" height="20" rx="10" fill="#c7d2fe" />
              {/* Person silhouette seated */}
              {/* Head */}
              <circle cx="100" cy="48" r="16" fill="#6366f1" />
              {/* Body */}
              <path d="M 100 64 Q 88 90 82 110" stroke="#6366f1" strokeWidth="6" fill="none" strokeLinecap="round" />
              <path d="M 100 64 Q 112 90 118 110" stroke="#6366f1" strokeWidth="6" fill="none" strokeLinecap="round" />
              {/* Arms */}
              <path d="M 94 75 Q 74 85 70 100" stroke="#6366f1" strokeWidth="5" fill="none" strokeLinecap="round" />
              <path d="M 106 75 Q 126 85 130 100" stroke="#6366f1" strokeWidth="5" fill="none" strokeLinecap="round" />
              {/* Thighs angled */}
              <path d="M 88 108 L 68 140" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
              <path d="M 112 108 L 132 140" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
              {/* Shins angled down to footrest */}
              <path d="M 68 140 L 56 168" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
              <path d="M 132 140 L 144 168" stroke="#6366f1" strokeWidth="5" strokeLinecap="round" />
              {/* Footrest platform */}
              <rect x="38" y="164" width="124" height="10" rx="5" fill="#a5b4fc" />
              {/* Angle label */}
              <text x="155" y="160" fill="#6366f1" fontSize="13" fontWeight="bold">{angle}°</text>
              <path d="M 144 168 A 16 16 0 0 0 160 168" stroke="#6366f1" strokeWidth="2" fill="none" strokeDasharray="3 2" />
            </svg>
            <p className="text-indigo-700 font-bold text-sm mt-1">발판 각도 {angle}° · 최적 스쿼트 자세</p>
            <p className="text-indigo-400 text-xs mt-0.5">항문직장각 최적화 · 배변 효율 향상</p>
          </div>

          {/* Angle control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-foreground">발판 각도 조절</span>
              <span className="font-bold text-indigo-600">{angle}°</span>
            </div>
            <input
              type="range" min={25} max={45} step={5} value={angle}
              onChange={e => setAngle(parseInt(e.target.value))}
              className="w-full accent-indigo-500"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>25°</span>
              <span className="text-indigo-500 font-semibold">권장: 35°</span>
              <span>45°</span>
            </div>
          </div>
        </div>

        {/* Auto mode */}
        <div className={`rounded-2xl p-4 flex items-center justify-between border ${autoMode ? "bg-indigo-50 border-indigo-200" : "bg-white border-border"}`}>
          <div>
            <p className="font-bold text-indigo-800 text-sm">자동 발판 조절</p>
            <p className="text-indigo-600 text-xs mt-0.5">착석 감지 시 자동으로 최적 각도로 조절</p>
          </div>
          <button
            onClick={() => setAutoMode(v => !v)}
            className={`w-14 h-8 rounded-full transition-all relative flex-shrink-0 ${autoMode ? "bg-indigo-500" : "bg-slate-200"}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow absolute top-1 transition-all ${autoMode ? "left-7" : "left-1"}`} />
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-border">
          <p className="font-bold text-foreground text-sm mb-3">스쿼트 자세의 효과</p>
          <div className="space-y-2.5">
            {[
              "항문직장각을 126° → 102°로 최적화하여 배변 효율을 높입니다",
              "직장 압박을 최소화하여 치질 예방 및 통증 완화에 도움이 됩니다",
              "배변 시간을 단축하여 항문에 가해지는 압력을 줄입니다",
              "복부 압박을 줄여 변비 해소에 효과적입니다",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 text-xs flex items-center justify-center flex-shrink-0 font-bold">{i + 1}</span>
                <span className="text-xs text-foreground leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

// ── Warnings Screen ────────────────────────────────────────────────────────

function WarningsScreen({ onBack }: { onBack: () => void }) {
  const [dismissed, setDismissed] = useState<number[]>([]);

  const active = warningList.filter(w => !dismissed.includes(w.id));
  const past = warningList.filter(w => dismissed.includes(w.id));

  const SEV = {
    critical: { bg: "bg-red-50", border: "border-red-200", iconBg: "bg-red-500", text: "text-red-700", badge: "bg-red-100 text-red-700 border-red-200", label: "위험" },
    warning:  { bg: "bg-amber-50", border: "border-amber-200", iconBg: "bg-amber-500", text: "text-amber-700", badge: "bg-amber-100 text-amber-700 border-amber-200", label: "주의" },
    info:     { bg: "bg-blue-50", border: "border-blue-200", iconBg: "bg-blue-400", text: "text-blue-700", badge: "bg-blue-100 text-blue-700 border-blue-200", label: "정보" },
  };

  return (
    <div className="min-h-screen bg-[#EEF7FA]">
      <PageHeader title="경고 · 알림 내역" onBack={onBack} />

      <div className="px-4 py-5 space-y-4">

        {active.length === 0 ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-8 flex flex-col items-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <p className="font-bold text-green-700 text-base">모든 알림을 확인했습니다</p>
            <p className="text-xs text-green-600">현재 이상 징후가 없습니다</p>
          </div>
        ) : (
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              미확인 알림 ({active.length}건)
            </p>
            <div className="space-y-3">
              {active.map(w => {
                const s = SEV[w.severity as keyof typeof SEV];
                return (
                  <div key={w.id} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${s.iconBg} rounded-2xl flex items-center justify-center text-xl flex-shrink-0`}>
                        {w.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`font-bold text-sm ${s.text}`}>{w.title}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border ${s.badge}`}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{w.desc}</p>
                        <p className="text-[10px] text-muted-foreground mt-1.5 font-medium">{w.date}</p>
                      </div>
                      <button
                        onClick={() => setDismissed(prev => [...prev, w.id])}
                        className="p-1.5 rounded-xl hover:bg-black/10 transition-colors flex-shrink-0"
                        title="확인"
                      >
                        <Check className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {past.length > 0 && (
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-1">
              확인한 알림 ({past.length}건)
            </p>
            <div className="space-y-2">
              {past.map(w => (
                <div key={w.id} className="bg-white/60 rounded-2xl p-3.5 border border-border flex items-center gap-3 opacity-60">
                  <span className="text-lg">{w.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{w.title}</p>
                    <p className="text-[10px] text-muted-foreground">{w.date}</p>
                  </div>
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ── Root App ───────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [navTab, setNavTab] = useState<NavTab>("home");
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Sitz bath state lifted here so it persists
  const [sitzOn, setSitzOn] = useState(false);
  const [sitzTemp, setSitzTemp] = useState(38);
  const [sitzDuration, setSitzDuration] = useState(10);

  const go = (s: Screen) => {
    setScreen(s);
    if (s === "analysis") setNavTab("analysis");
    else if (s === "health-report") setNavTab("report");
    else if (s === "warnings") setNavTab("alerts");
    else if (s === "dashboard") setNavTab("home");
  };

  const selectProfile = (p: Profile) => {
    setActiveProfile(p);
    go("dashboard");
  };

  const saveProfile = (p: Profile) => {
    if (profiles.find(x => x.id === p.id)) {
      setProfiles(prev => prev.map(x => x.id === p.id ? p : x));
      if (activeProfile?.id === p.id) setActiveProfile(p);
    } else {
      setProfiles(prev => [...prev, p]);
    }
    setScreen("profile-select");
  };

  const deleteProfile = (id: string) => {
    setProfiles(prev => prev.filter(x => x.id !== id));
    if (activeProfile?.id === id) setActiveProfile(null);
  };

  const inApp = !["home", "profile-select", "profile-edit"].includes(screen);

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4"
      style={{ fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div
        className="relative w-full max-w-[430px] bg-background shadow-2xl overflow-hidden flex flex-col"
        style={{ minHeight: "100dvh", maxHeight: "100dvh", borderRadius: "2rem" }}
      >
        {/* Scroll area */}
        <div
          className={`flex-1 overflow-y-auto ${inApp ? "pb-20" : ""}`}
          style={{ scrollbarWidth: "none" }}
        >
          {screen === "home" && (
            <HomeScreen onSelectProfile={() => setScreen("profile-select")} />
          )}
          {screen === "profile-select" && (
            <ProfileSelectScreen
              profiles={profiles}
              onSelect={selectProfile}
              onEdit={p => { setEditingProfile(p); setScreen("profile-edit"); }}
              onAdd={() => { setEditingProfile(null); setScreen("profile-edit"); }}
              onBack={() => setScreen("home")}
              onDelete={deleteProfile}
            />
          )}
          {screen === "profile-edit" && (
            <ProfileEditScreen
              profile={editingProfile}
              onSave={saveProfile}
              onBack={() => setScreen("profile-select")}
            />
          )}
          {screen === "dashboard" && activeProfile && (
            <DashboardScreen
              profile={activeProfile}
              onNavigate={go}
              onProfileSelect={() => setScreen("profile-select")}
            />
          )}
          {screen === "health-report" && (
            <HealthReportScreen onBack={() => go("dashboard")} />
          )}
          {screen === "warnings" && (
            <WarningsScreen onBack={() => go("dashboard")} />
          )}
          {screen === "analysis" && (
            <AnalysisScreen onBack={() => go("dashboard")} />
          )}
          {screen === "odor" && (
            <OdorScreen onBack={() => go("dashboard")} />
          )}
          {screen === "sitz-bath" && (
            <SitzBathScreen
              on={sitzOn} setOn={setSitzOn}
              temp={sitzTemp} setTemp={setSitzTemp}
              duration={sitzDuration} setDuration={setSitzDuration}
              onBack={() => go("dashboard")}
            />
          )}
          {screen === "posture" && (
            <PostureScreen onBack={() => go("dashboard")} />
          )}
        </div>

        {/* Bottom Navigation */}
        {inApp && (
          <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-border safe-area-inset-bottom">
            <div className="grid grid-cols-4 h-16">
              {[
                { tab: "home" as NavTab, Icon: Home, label: "홈", target: "dashboard" as Screen },
                { tab: "analysis" as NavTab, Icon: Activity, label: "분석", target: "analysis" as Screen },
                { tab: "report" as NavTab, Icon: BarChart2, label: "리포트", target: "health-report" as Screen },
                { tab: "alerts" as NavTab, Icon: Bell, label: "알림", target: "warnings" as Screen },
              ].map(({ tab, Icon, label, target }) => (
                <button
                  key={tab}
                  onClick={() => go(target)}
                  className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                    navTab === tab ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-transform ${navTab === tab ? "scale-110" : ""}`} />
                  <span className={`text-[10px] font-semibold ${navTab === tab ? "font-bold" : ""}`}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
