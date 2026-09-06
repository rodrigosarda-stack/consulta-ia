// medir-vocabulario.mjs — o parâmetro `prompt` do Whisper melhora o
// reconhecimento de nome de remédio? A MarIA hoje NÃO usa esse parâmetro.
//
// Mesmo áudio, N rodadas com e sem vocabulário enxertado. Conta quantas vezes
// cada termo do roteiro aparece correto na transcrição.
const LAB = "https://xzknmihhtgwggpndpivb.supabase.co/functions/v1/lab-prompt?s=lab-6f2a9c4e-2026";
const AUDIO = "e28cd2ce-84ec-4b2f-a205-fbe43eb87338/cbbe55aa-ecf3-4845-aba5-ba49e8c237de.wav";
const N = 6;

// ≤224 tokens é o teto do Whisper pro prompt. Vocabulário do domínio +
// os termos que esta consulta contém.
const VOCAB =
  "Consulta de ortopedia. Medicamentos: losartana, enalapril, hidroclorotiazida, " +
  "metformina, omeprazol, dipirona, ibuprofeno, paracetamol, sertralina, atenolol, " +
  "sinvastatina, levotiroxina, amoxicilina. Termos: condropatia patelar, menisco medial, " +
  "derrame articular, palpação, amplitude de movimento, quadríceps, ressonância magnética, " +
  "fisioterapia, bicicleta ergométrica, hipótese diagnóstica, conduta, pronto-socorro.";

// termo do roteiro → regex que aceita a grafia correta
const ALVOS = [
  ["losartana (o crítico)", /losartana/i],
  ["joelho direito", /joelho\s+direito/i],
  ["condropatia patelar", /condropatia\s+patelar/i],
  ["menisco medial", /menisco\s+medial/i],
  ["dipirona", /dipirona/i],
  ["ressonância magnética", /resson[âa]ncia\s+magn[ée]tica/i],
  ["quadríceps", /quadr[íi]ceps/i],
  ["fisioterapia", /fisioterapia/i],
];

async function transcrever(vocab) {
  const r = await fetch(LAB, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: AUDIO, vocab }),
  });
  const d = await r.json();
  if (d.error) throw new Error(`${d.error} ${d.detalhe || ""}`);
  return d.texto || "";
}

async function rodada(nome, vocab) {
  const textos = [];
  for (let i = 0; i < N; i++) textos.push(await transcrever(vocab));
  const placar = ALVOS.map(([t, re]) => [t, textos.filter((x) => re.test(x)).length]);
  console.log(`\n${"═".repeat(60)}\n${nome}  (${N} rodadas)`);
  for (const [t, n] of placar) {
    const barra = "█".repeat(n) + "·".repeat(N - n);
    console.log(`  ${barra}  ${String(n).padStart(2)}/${N}  ${t}`);
  }
  const total = placar.reduce((s, [, n]) => s + n, 0);
  console.log(`  → ${total}/${ALVOS.length * N} termos corretos no total`);
  return { textos, placar, total };
}

const sem = await rodada("SEM vocabulário  (como a MarIA está hoje)", null);
const com = await rodada("COM vocabulário  (parâmetro prompt)", VOCAB);

console.log(`\n${"═".repeat(60)}\nDIFERENÇA`);
for (let i = 0; i < ALVOS.length; i++) {
  const d = com.placar[i][1] - sem.placar[i][1];
  const sinal = d > 0 ? `+${d}` : d < 0 ? `${d}` : " 0";
  console.log(`  ${sinal.padStart(3)}  ${ALVOS[i][0]}`);
}
console.log(`\n  total: ${sem.total} → ${com.total}  (${com.total - sem.total >= 0 ? "+" : ""}${com.total - sem.total})`);

console.log(`\n=== como saiu o trecho do remédio ===`);
for (const [rot, arr] of [["sem", sem.textos], ["com", com.textos]]) {
  const vistos = new Set();
  for (const t of arr) {
    const m = t.match(/.{0,60}(50\s*(mg|miligram)|certana|losartana|sartana).{0,60}/i);
    const s = (m ? m[0] : "(não achou o trecho)").replace(/\s+/g, " ").trim();
    if (!vistos.has(s)) { vistos.add(s); console.log(`  [${rot}] …${s}…`); }
  }
}
