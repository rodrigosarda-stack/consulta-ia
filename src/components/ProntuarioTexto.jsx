// Renderiza o texto do prontuário pra leitura rápida: título de seção (CAIXA
// ALTA) em negrito, e a seção "O QUE EU INTERPRETEI" em destaque — é onde a IA
// diz o que teve que adivinhar, pro médico conferir. O texto em si é o mesmo
// que vai pro WhatsApp e pro PDF; só a apresentação muda.
const TITULO = /^(\d+\.\s+)?[A-ZÁÉÍÓÚÂÊÔÃÕÇ][A-ZÁÉÍÓÚÂÊÔÃÕÇ0-9 \-\/]{2,}$/

export default function ProntuarioTexto({ texto, style }) {
  const linhas = (texto || '').split('\n')
  let emInterpretacao = false
  return (
    <div style={{ fontSize: 14, lineHeight: 1.7, color: '#a8c0d8', whiteSpace: 'pre-wrap', wordBreak: 'break-word', ...style }}>
      {linhas.map((l, i) => {
        const t = l.trim()
        if (TITULO.test(t)) {
          emInterpretacao = /INTERPRETEI/.test(t)
          return (
            <div key={i} style={{ fontWeight: 700, fontSize: 12, letterSpacing: 0.6, color: emInterpretacao ? '#fbbf24' : '#e2eaf6', marginTop: i ? 16 : 0, marginBottom: 2 }}>
              {t}
            </div>
          )
        }
        return <div key={i} style={{ color: emInterpretacao ? '#d9c88f' : undefined }}>{l || ' '}</div>
      })}
    </div>
  )
}
