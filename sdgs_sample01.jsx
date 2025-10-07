import React, { useEffect, useMemo, useRef, useState } from "react";

// =============================
// SDGs Learning Game (Kids)
// - Single-file React component
// - TailwindCSS for styling (no external imports)
// - Two mini-games:
//   1) Drag & Drop: 「やってみよう！」カードをSDGs目標に仕分け
//   2) 3択クイズ
// - ローカルストレージで進捗保存
// =============================

const SDG_COLORS = {
  1: "bg-[#e5243b]",
  2: "bg-[#dda63a]",
  3: "bg-[#4c9f38]",
  4: "bg-[#c5192d]",
  5: "bg-[#ff3a21]",
  6: "bg-[#26bde2]",
  7: "bg-[#fcc30b]",
  8: "bg-[#a21942]",
  9: "bg-[#fd6925]",
  10: "bg-[#dd1367]",
  11: "bg-[#fd9d24]",
  12: "bg-[#bf8b2e]",
  13: "bg-[#3f7e44]",
  14: "bg-[#0a97d9]",
  15: "bg-[#56c02b]",
  16: "bg-[#00689d]",
  17: "bg-[#19486a]",
};

const SDG_GOALS = [
  { id: 1, title: "貧困をなくそう" },
  { id: 2, title: "飢餓をゼロに" },
  { id: 3, title: "すべての人に健康と福祉を" },
  { id: 4, title: "質の高い教育をみんなに" },
  { id: 5, title: "ジェンダー平等を実現しよう" },
  { id: 6, title: "安全な水とトイレを世界中に" },
  { id: 7, title: "エネルギーをみんなに そしてクリーンに" },
  { id: 8, title: "働きがいも経済成長も" },
  { id: 9, title: "産業と技術革新の基盤をつくろう" },
  { id: 10, title: "人や国の不平等をなくそう" },
  { id: 11, title: "住み続けられるまちづくりを" },
  { id: 12, title: "つくる責任 つかう責任" },
  { id: 13, title: "気候変動に具体的な対策を" },
  { id: 14, title: "海の豊かさを守ろう" },
  { id: 15, title: "陸の豊かさも守ろう" },
  { id: 16, title: "平和と公正をすべての人に" },
  { id: 17, title: "パートナーシップで目標を達成しよう" },
];

// やってみよう！アクション集（代表例）
const ACTIONS = [
  { id: "a1", text: "フードドライブに食品をあつめる", goal: 2 },
  { id: "a2", text: "健康診断をうけて体をまもる", goal: 3 },
  { id: "a3", text: "読み聞かせで勉強をたのしく", goal: 4 },
  { id: "a4", text: "だれでも参加できるクラブづくり", goal: 5 },
  { id: "a5", text: "水を出しっぱなしにしない", goal: 6 },
  { id: "a6", text: "電気をつかわない時は消す", goal: 7 },
  { id: "a7", text: "地元で作られた物をえらぶ", goal: 8 },
  { id: "a8", text: "物を長く使いリサイクル", goal: 12 },
  { id: "a9", text: "植林ボランティアに参加", goal: 15 },
  { id: "a10", text: "公共交通をつかってCO₂をへらす", goal: 13 },
  { id: "a11", text: "海にゴミをすてない・ひろう", goal: 14 },
  { id: "a12", text: "みんなが話せるルールづくり", goal: 16 },
  { id: "a13", text: "ちがいをみとめ合う", goal: 10 },
  { id: "a14", text: "安全な通学路をまもる活動", goal: 11 },
  { id: "a15", text: "地域の人や学校と協力する", goal: 17 },
  { id: "a16", text: "予防接種の大切さを広める", goal: 3 },
  { id: "a17", text: "節水コマをつける", goal: 6 },
];

const QUIZ = [
  {
    q: "『つくる責任 つかう責任』にあてはまる行動はどれ？",
    choices: [
      { t: "買いすぎずに食べきる", correct: true },
      { t: "電気をつけっぱなしにする" },
      { t: "ゴミを分けずに捨てる" },
    ],
    goal: 12,
  },
  {
    q: "『海の豊かさを守ろう』につながるのは？",
    choices: [
      { t: "ポイ捨てをしない", correct: true },
      { t: "車で短い距離でも移動する" },
      { t: "使いすてのストローをたくさん使う" },
    ],
    goal: 14,
  },
  {
    q: "『ジェンダー平等』ってなにが大切？",
    choices: [
      { t: "だれでも同じチャンスがある", correct: true },
      { t: "男の子だけがリーダー" },
      { t: "女の子だけが家事をする" },
    ],
    goal: 5,
  },
  {
    q: "『気候変動に対策を』につながるのは？",
    choices: [
      { t: "エアコン設定を見直す", correct: true },
      { t: "水を出しっぱなしにする" },
      { t: "ごみを分別しない" },
    ],
    goal: 13,
  },
  {
    q: "『安全な水とトイレ』のためにできることは？",
    choices: [
      { t: "トイレの使い方を守る", correct: true },
      { t: "ペットボトルを川に捨てる" },
      { t: "歯みがき中に水出しっぱなし" },
    ],
    goal: 6,
  },
];

function useLocalStorage(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

function GoalBadge({ id, title, small = false }) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-white shadow ${SDG_COLORS[id]}`}
      role="img"
      aria-label={`SDGs目標${id}: ${title}`}
    >
      <span className={`font-bold ${small ? "text-sm" : "text-base"}`}>{id}</span>
      <span className={`${small ? "text-sm" : "text-base"}`}>{title}</span>
    </div>
  );
}

function Section({ title, subtitle, children, right }) {
  return (
    <section className="w-full">
      <div className="flex items-end justify-between gap-4 mb-3">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {right}
      </div>
      <div className="bg-white rounded-2xl shadow p-4 md:p-6">{children}</div>
    </section>
  );
}

function DnDGame({ onScore }) {
  const [deck, setDeck] = useState(() => shuffle(ACTIONS).slice(0, 8));
  const [done, setDone] = useState([]); // {actionId, goalId, correct}
  const remaining = deck.filter(a => !done.find(d => d.actionId === a.id));

  const handleDrop = (actionId, goalId) => {
    const action = deck.find(a => a.id === actionId);
    if (!action) return;
    const correct = action.goal === goalId;
    if (!done.find(d => d.actionId === actionId)) {
      setDone(d => [...d, { actionId, goalId, correct }]);
      onScore(correct ? 10 : 0);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-2">① カードをドラッグして 右の目標に入れよう</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {remaining.map(card => (
            <DraggableCard key={card.id} id={card.id} text={card.text} />
          ))}
        </div>
        {remaining.length === 0 && (
          <div className="mt-4 text-green-700 font-semibold">ぜんぶ仕分けできたよ！おめでとう🎉</div>
        )}
      </div>
      <div>
        <h3 className="font-semibold mb-2">② 目標（ここにドロップ！）</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {uniqueGoals(deck).map(g => (
            <DropZone key={g} goal={g} onDrop={handleDrop} results={done} />
          ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <h3 className="font-semibold mb-2">結果</h3>
        <ul className="space-y-1 text-sm">
          {done.map((r, i) => {
            const a = deck.find(x => x.id === r.actionId);
            const g = SDG_GOALS.find(x => x.id === r.goalId);
            return (
              <li key={i} className={r.correct ? "text-green-700" : "text-red-700"}>
                ・「{a?.text}」→ 目標{g?.id}「{g?.title}」 … {r.correct ? "正解！" : "ちがうよ"}
              </li>
            );
          })}
          {done.length === 0 && <li>カードを仕分けすると結果が出るよ。</li>}
        </ul>
      </div>
    </div>
  );
}

function DraggableCard({ id, text }) {
  return (
    <div
      draggable
      onDragStart={e => e.dataTransfer.setData("text/plain", id)}
      className="rounded-xl border p-3 shadow hover:shadow-md transition focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-move bg-indigo-50"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === "Enter" || e.key === " ") {
          // キーボード操作の簡易サポート：選択状態をDataTransfer代わりに保持
          navigator.clipboard?.writeText(id);
        }
      }}
      aria-grabbed
    >
      <p className="text-sm">{text}</p>
      <p className="text-[10px] text-gray-500 mt-1">ドラッグして仕分け</p>
    </div>
  );
}

function DropZone({ goal, onDrop, results }) {
  const ref = useRef(null);
  const g = SDG_GOALS.find(x => x.id === goal);
  const isOver = useRef(false);

  return (
    <div
      ref={ref}
      onDragOver={e => {
        e.preventDefault();
        isOver.current = true;
      }}
      onDragLeave={() => (isOver.current = false)}
      onDrop={e => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        if (id) onDrop(id, goal);
        isOver.current = false;
      }}
      className={`rounded-2xl border-2 p-3 min-h-[96px] flex flex-col gap-2 ${
        isOver.current ? "border-indigo-500" : "border-dashed border-gray-300"
      } bg-white`}
      role="button"
      aria-label={`目標${goal}へドロップ`}
      tabIndex={0}
    >
      <GoalBadge id={g.id} title={g.title} small />
      <div className="text-xs text-gray-500">ここにカードを入れてね</div>
      <div className="space-y-1">
        {results
          .filter(r => r.goalId === goal)
          .map((r, i) => (
            <div
              key={i}
              className={`text-xs px-2 py-1 rounded ${r.correct ? "bg-green-100" : "bg-red-100"}`}
            >
              {r.correct ? "✅" : "❌"} {r.correct ? "正解" : "ちがうよ"}
            </div>
          ))}
      </div>
    </div>
  );
}

function Quiz({ onScore }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]); // true/false
  const done = step >= QUIZ.length;

  const current = QUIZ[step];

  const choose = (correct) => {
    setAnswers(a => [...a, !!correct]);
    if (correct) onScore(10);
    setTimeout(() => setStep(s => s + 1), 400);
  };

  const correctCount = answers.filter(Boolean).length;

  return (
    <div>
      {!done ? (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">{step + 1} / {QUIZ.length}</div>
          <p className="text-lg font-semibold">{current.q}</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {current.choices.map((c, i) => (
              <button
                key={i}
                className="rounded-xl border px-3 py-3 hover:shadow focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onClick={() => choose(!!c.correct)}
              >
                {c.t}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xl font-bold">結果</div>
          <div>正解数: {correctCount} / {QUIZ.length}</div>
          <p className="text-sm text-gray-600">もういちど挑戦して点をのばそう！</p>
          <button
            className="mt-2 rounded-xl bg-indigo-600 text-white px-4 py-2 shadow hover:opacity-90"
            onClick={() => {
              setStep(0);
              setAnswers([]);
            }}
          >もう一度チャレンジ</button>
        </div>
      )}
    </div>
  );
}

function Badge({ text }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
      🏅 {text}
    </span>
  );
}

function Progress({ value, max }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${percent}%` }} />
    </div>
  );
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function uniqueGoals(actions) {
  return [...new Set(actions.map(a => a.goal))];
}

export default function SDGsKidsGame() {
  const [tab, setTab] = useState("guide");
  const [score, setScore] = useLocalStorage("sdgs_kids_score", 0);
  const [played, setPlayed] = useLocalStorage("sdgs_kids_played", { dnd: 0, quiz: 0 });

  const addScore = (n) => setScore(s => s + n);

  const resetAll = () => {
    setScore(0);
    setPlayed({ dnd: 0, quiz: 0 });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white text-gray-900">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🌏</span>
            <h1 className="text-xl md:text-2xl font-extrabold">SDGs キッズゲーム</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-32">
              <Progress value={score % 100} max={100} />
              <div className="text-[10px] text-right text-gray-500">100点でバッジGET</div>
            </div>
            <div className="text-sm font-bold">スコア: {score}</div>
            <button
              className="rounded-xl border px-3 py-1.5 hover:bg-gray-50"
              onClick={resetAll}
              title="リセット"
            >
              リセット
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Tabs */}
        <nav className="flex gap-2 flex-wrap">
          {[
            { id: "guide", label: "ガイド" },
            { id: "dnd", label: "やってみよう！（仕分け）" },
            { id: "quiz", label: "3択クイズ" },
            { id: "goals", label: "17の目標" },
            { id: "report", label: "レポート" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-4 py-2 text-sm border ${
                tab === t.id ? "bg-indigo-600 text-white" : "bg-white hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "guide" && (
          <Section title="遊び方" subtitle="SDGs(エスディージーズ)は、みんなでめざす17の目標！">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <p>このゲームでは、毎日のくらしでできる <b>アクション</b> を学びながら、SDGsの目標を楽しくまなべるよ。</p>
                <ul className="list-disc ml-6 space-y-1 text-sm">
                  <li><b>やってみよう！</b>：カードを正しい目標にドラッグ&ドロップ</li>
                  <li><b>3択クイズ</b>：正しいと思う答えをえらぼう</li>
                  <li>点がたまると <b>バッジ</b> がもらえるよ！</li>
                </ul>
                <div className="flex gap-2 flex-wrap">
                  <Badge text="ドラッグ達人" />
                  <Badge text="クイズ名人" />
                </div>
                <div className="text-xs text-gray-500">※ スコアはこの端末に保存されます</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SDG_GOALS.slice(0, 9).map(g => (
                  <div key={g.id} className={`rounded-xl h-16 ${SDG_COLORS[g.id]} text-white flex items-center justify-center font-bold`}>{g.id}</div>
                ))}
                {SDG_GOALS.slice(9).map(g => (
                  <div key={g.id} className={`rounded-xl h-16 ${SDG_COLORS[g.id]} text-white flex items-center justify-center font-bold`}>{g.id}</div>
                ))}
              </div>
            </div>
          </Section>
        )}

        {tab === "dnd" && (
          <Section
            title="やってみよう！（仕分けゲーム）"
            subtitle="カードを正しい目標へ入れよう。正解で +10 点！"
            right={
              <button
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 shadow hover:opacity-90"
                onClick={() => setPlayed(p => ({ ...p, dnd: p.dnd + 1 }))}
              >
                プレイ完了にする
              </button>
            }
          >
            <DnDGame onScore={addScore} />
          </Section>
        )}

        {tab === "quiz" && (
          <Section
            title="3択クイズ"
            subtitle="正しい答えで +10 点！全部で5問"
            right={
              <button
                className="rounded-xl bg-indigo-600 text-white px-4 py-2 shadow hover:opacity-90"
                onClick={() => setPlayed(p => ({ ...p, quiz: p.quiz + 1 }))}
              >
                プレイ完了にする
              </button>
            }
          >
            <Quiz onScore={addScore} />
          </Section>
        )}

        {tab === "goals" && (
          <Section title="17の目標" subtitle="クリックで覚えよう！">
            <div className="grid md:grid-cols-3 gap-4">
              {SDG_GOALS.map(g => (
                <div key={g.id} className="rounded-2xl bg-white border shadow p-4 flex gap-3 items-start">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold ${SDG_COLORS[g.id]}`}>{g.id}</div>
                  <div>
                    <div className="font-semibold">{g.title}</div>
                    <p className="text-sm text-gray-600 mt-1">身近な例：{exampleForGoal(g.id)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {tab === "report" && (
          <Section title="レポート">
            <div className="space-y-3">
              <div className="text-lg font-bold">合計スコア: {score} 点</div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border p-3">
                  <div className="font-semibold mb-1">プレイ回数</div>
                  <ul className="text-sm space-y-1">
                    <li>やってみよう！（仕分け）: {played.dnd} 回</li>
                    <li>3択クイズ: {played.quiz} 回</li>
                  </ul>
                </div>
                <div className="rounded-xl border p-3">
                  <div className="font-semibold mb-1">バッジ</div>
                  <div className="flex gap-2 flex-wrap">
                    {score >= 50 && <Badge text="スターター" />}
                    {score >= 100 && <Badge text="SDGs キッズマスター" />}
                  </div>
                  {score < 50 && <div className="text-xs text-gray-500 mt-2">あと {50 - score} 点でスターター！</div>}
                </div>
              </div>
              <button className="rounded-xl border px-4 py-2 hover:bg-gray-50" onClick={resetAll}>はじめから</button>
            </div>
          </Section>
        )}
      </main>

      <footer className="max-w-5xl mx-auto px-4 pb-10 text-xs text-gray-500">
        © SDGs Kids Game – 学校・地域イベントでの無償利用OK / ローカル保存のみ
      </footer>
    </div>
  );
}

function exampleForGoal(id) {
  switch (id) {
    case 1:
      return "困っている人への寄付や支援";
    case 2:
      return "食べ残しを減らす・フードドライブ";
    case 3:
      return "手洗い・うがい・適度な運動";
    case 4:
      return "図書館やオンライン学習を活用";
    case 5:
      return "みんなが発言できる教室づくり";
    case 6:
      return "節水・トイレの正しい使い方";
    case 7:
      return "電気のこまめな消灯";
    case 8:
      return "地域のお店を応援";
    case 9:
      return "壊れにくい物を選ぶ・直して使う";
    case 10:
      return "ちがいをそんちょうし合う";
    case 11:
      return "ゴミ拾い・安全な通学路";
    case 12:
      return "リデュース・リユース・リサイクル";
    case 13:
      return "公共交通や自転車を使う";
    case 14:
      return "海にゴミを出さない";
    case 15:
      return "植樹・生き物を大切に";
    case 16:
      return "順番やルールを守る";
    case 17:
      return "家族・学校・地域と協力";
    default:
      return "";
  }
}
