import React, { useEffect, useState } from 'react'
import { Phone, Scissors, Gift, Coffee } from 'lucide-react'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const BENEFICIARY_NAME = 'Sandry Perdomo'
const BENEFICIARY_IMAGE =
  'https://i.postimg.cc/NjMQ91v4/sandry-benefic2.jpg'
const BENEFICIARY_TEXT = `Fundación Esperanza supports children with critical health conditions. Your contribution helps provide vital treatments and care.`

const PRIZES = [
  { icon: Scissors, label: 'Haircut + facial ✂️✨' },
  { icon: Coffee, label: 'A bottle of whiskey 🥃' },
  { icon: Gift, label: 'Other prizes donated' },
]

const PAYMENT_AMOUNT = '2,000 CLP'
const PAYMENT_METHODS = [
  'Cuenta a Transferir: Banco Estado Cuenta Rut ',
  'Nombre: Jose Marin',
  'Rut: 27.075.333-7',
  'Cuenta: 27075333',
]

const WHATSAPP_PHONE = '+56957199022' // example Chile phone number with country code

// Get environment variables safely
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabase: SupabaseClient | null = null
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export default function App() {
  const [soldNumbers, setSoldNumbers] = useState<Set<string>>(new Set())
  const [selectedNumber, setSelectedNumber] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase environment variables are missing.')
      setLoading(false)
      return
    }

    async function fetchSoldNumbers() {
      setLoading(true)
      const { data, error } = await supabase
        .from('raffle_numbers')
        .select('number')
        .eq('sold', true)

      if (error) {
        console.error('Error fetching sold numbers:', error)
        setError('Failed to fetch sold numbers.')
        setSoldNumbers(new Set())
      } else {
        const soldSet = new Set(data?.map((row) => row.number) ?? [])
        setSoldNumbers(soldSet)
        setError(null)
      }
      setLoading(false)
    }
    fetchSoldNumbers()
  }, [])

  function formatNumber(n: number) {
    return n.toString().padStart(3, '0')
  }

  function handleNumberClick(num: string) {
    if (soldNumbers.has(num)) return
    setSelectedNumber(num)
  }

  const whatsappLink = selectedNumber
    ? `https://wa.me/${WHATSAPP_PHONE}?text=Hello,%20I%20want%20to%20buy%20the%20number%20${selectedNumber}`
    : `https://wa.me/${WHATSAPP_PHONE}`

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-600 font-semibold text-center">{error}</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-white text-gray-900 flex flex-col items-center p-4 max-w-7xl mx-auto">
      <header className="mb-6 text-center">
        <h1
          className="text-3xl sm:text-4xl font-extrabold tracking-tight"
          aria-label={`Raffle to benefit ${BENEFICIARY_NAME}`}
        >
          Rifa a Beneficio <span className="text-blue-600">{BENEFICIARY_NAME}</span> 💙.
        </h1>
      </header>

      <section
        aria-labelledby="beneficiary-title"
        className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 max-w-4xl"
      >
        <img
          src={BENEFICIARY_IMAGE}
          alt={`Photo representing ${BENEFICIARY_NAME}`}
          className="w-full sm:w-70 rounded-lg object-cover shadow-md"
          loading="lazy"
        />
        <div>
 
        </div>
      </section>



      <section aria-labelledby="payment-title" className="mb-8 w-full max-w-4xl">
        <h2 id="payment-title" className="text-xl font-semibold mb-4">
          Información para aportar
        </h2>
        <p className="mb-2">
        Valor del Número:{' '}
          <strong className="text-2xl text-blue-700 font-extrabold">${PAYMENT_AMOUNT}</strong>
        </p>
        <ul className="list-disc list-inside text-gray-700 mb-2">
          {PAYMENT_METHODS.map((method) => (
            <li key={method}>{method}</li>
          ))}
        </ul>
        <p className="text-xs text-gray-500 italic">
          Fecha Rifa: 12 de Septiembre 2025.
        </p>
      </section>

      <section
        aria-labelledby="contact-title"
        className="mb-8 w-full max-w-4xl flex flex-col items-center"
      >
        <h2 id="contact-title" className="text-xl font-semibold mb-4">
          Contacto para cualquier Información
        </h2>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          role="button"
          aria-label={
            selectedNumber
              ? `Contact via WhatsApp to buy number ${selectedNumber}`
              : 'Contact via WhatsApp'
          }
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 focus-visible:ring-4 focus-visible:ring-green-300 text-white font-semibold rounded-lg px-6 py-3 transition-colors focus:outline-none"
        >
          <Phone size={20} aria-hidden="true" />
          WhatsApp
        </a>
      </section>

      <section
        aria-labelledby="numbers-title"
        className="w-full max-w-5xl"
        role="region"
        aria-live="polite"
      >
        <h2 id="numbers-title" className="text-xl font-semibold mb-4 text-center">
          Verifica los numeros disponibles
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading numbers...</p>
        ) : (
          <div
            role="grid"
            aria-label="Raffle numbers"
            className="grid grid-cols-8 sm:grid-cols-16 gap-2"
          >
            {[...Array(500)].map((_, i) => {
              const num = formatNumber(i + 1)
              const isSold = soldNumbers.has(num)
              const isSelected = selectedNumber === num
              return (
                <button
                  key={num}
                  type="button"
                  role="gridcell"
                  aria-label={`${num} - ${isSold ? 'Sold' : 'Available'}`}
                  disabled={isSold}
                  title={isSold ? 'Vendido' : 'Disponible'}
                  onClick={() => handleNumberClick(num)}
                  className={`rounded-md border px-2 py-1 text-center text-sm font-mono focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-blue-500
                    ${
                      isSold
                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                        : isSelected
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-white text-gray-900 hover:bg-blue-100'
                    }`}
                >
                  {num}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}
