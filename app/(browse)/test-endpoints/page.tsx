'use client'

import { useState } from 'react'

// URL base del backend de Medusa desde variables de entorno
const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'

export default function TestEndpointsPage() {
  const [response, setResponse] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testEndpoint = async (endpoint: string, method: string = 'GET', body?: any) => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // Construir URL completa
      const fullUrl = `${MEDUSA_BACKEND_URL}${endpoint}`
      
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || '',
        },
      }

      if (body) {
        options.body = JSON.stringify(body)
      }

      console.log(`[TEST] Calling: ${method} ${fullUrl}`)
      const res = await fetch(fullUrl, options)
      const data = await res.json()

      setResponse({
        status: res.status,
        statusText: res.statusText,
        url: fullUrl,
        data,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">
          🧪 Prueba de Endpoints - Productos
        </h1>
        
        {/* Backend URL Info */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
          <h3 className="text-sm font-semibold text-indigo-900 mb-2">
            🔗 Backend URL
          </h3>
          <code className="text-sm text-indigo-800 bg-indigo-100 px-3 py-1 rounded">
            {MEDUSA_BACKEND_URL}
          </code>
          <p className="text-xs text-indigo-700 mt-2">
            Los endpoints se llaman directamente al backend de Medusa (no pasan por Next.js)
          </p>
        </div>

        {/* Endpoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* 1. GET /store/products */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              📦 Listar Productos
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              GET /store/products
            </p>
            <button
              onClick={() => testEndpoint('/store/products?limit=5')}
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Cargando...' : 'Probar'}
            </button>
          </div>

          {/* 2. GET /store/products/:id */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              🔍 Producto Individual
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              GET /store/products/:id
            </p>
            <input
              type="text"
              placeholder="ID del producto"
              id="product-id"
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                const id = (document.getElementById('product-id') as HTMLInputElement).value
                if (id) testEndpoint(`/store/products/${id}`)
              }}
              disabled={loading}
              className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Cargando...' : 'Probar'}
            </button>
          </div>

          {/* 3. POST /store/products/search */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              🔎 Búsqueda (Algolia)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              POST /store/products/search
            </p>
            <input
              type="text"
              placeholder="Término de búsqueda"
              id="search-query"
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                const query = (document.getElementById('search-query') as HTMLInputElement).value
                if (query) {
                  testEndpoint('/store/products/search', 'POST', {
                    query,
                    indexType: 'product',
                  })
                }
              }}
              disabled={loading}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Cargando...' : 'Probar'}
            </button>
          </div>

          {/* 4. GET /store/variants/:id */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              🎨 Variante Individual
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              GET /store/variants/:id
            </p>
            <input
              type="text"
              placeholder="ID de la variante"
              id="variant-id"
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                const id = (document.getElementById('variant-id') as HTMLInputElement).value
                if (id) testEndpoint(`/store/variants/${id}`)
              }}
              disabled={loading}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Cargando...' : 'Probar'}
            </button>
          </div>
        </div>

        {/* Response Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {response && (
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  📊 Respuesta
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {response.url}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  response.status >= 200 && response.status < 300
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {response.status} {response.statusText}
              </span>
            </div>
            
            {/* Response Details */}
            <div className="space-y-4">
              {/* Product Count if available */}
              {response.data?.count !== undefined && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-blue-900">
                    Total de productos: {response.data.count}
                  </p>
                  {response.data.has_customer_group_pricing && (
                    <p className="text-sm text-blue-700 mt-1">
                      ✅ Tiene precios de grupo de cliente
                      {response.data.customer_group_id && (
                        <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">
                          {response.data.customer_group_id}
                        </span>
                      )}
                    </p>
                  )}
                </div>
              )}

              {/* Search Results if available */}
              {response.data?.nbHits !== undefined && (
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-sm font-medium text-purple-900">
                    Resultados encontrados: {response.data.nbHits}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    Página {response.data.page + 1} de {response.data.nbPages}
                  </p>
                </div>
              )}

              {/* JSON Response */}
              <div className="bg-gray-50 p-4 rounded-md overflow-auto max-h-96">
                <pre className="text-xs text-gray-800">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Información
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Los precios se muestran en centavos (24693 = RD$ 246.93)</li>
            <li>• Moneda: DOP (Peso Dominicano)</li>
            <li>• Para precios de grupo, agregar header de autenticación</li>
            <li>• Solo productos con status &quot;published&quot; en listados</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
