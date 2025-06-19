import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.API_BASE_URL

if (!API_BASE_URL) {
  throw new Error('API_BASE_URL environment variable is required')
}

// Set body size limit to 100MB
export const maxDuration = 60 // 60 seconds (Vercel Hobby plan limit)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'GET')
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'POST')
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PUT')
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'DELETE')
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path, 'PATCH')
}

async function proxyRequest(
  request: NextRequest,
  path: string[],
  method: string
) {
  const targetPath = path.join('/')

  try {
    const searchParams = request.nextUrl.searchParams.toString()
    const targetUrl = `${API_BASE_URL}/${targetPath}${
      searchParams ? `?${searchParams}` : ''
    }`

    const headers: HeadersInit = {}

    // Forward important headers
    const authHeader = request.headers.get('authorization')
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const contentType = request.headers.get('content-type')

    // Handle request body with streaming for large files
    let body: string | FormData | ArrayBuffer | ReadableStream | undefined

    if (method !== 'GET' && method !== 'DELETE') {
      if (contentType?.includes('multipart/form-data')) {
        try {
          // For large files, stream directly instead of buffering
          const contentLength = request.headers.get('content-length')
          if (contentLength && parseInt(contentLength) > 4 * 1024 * 1024) {
            // > 4MB
            if (request.body) {
              body = request.body
              headers['Content-Type'] = contentType
            }
          } else {
            // Use FormData for smaller files to preserve multipart structure
            body = await request.formData()
          }
        } catch (error) {
          console.error('[PROXY] Multipart data processing failed:', {
            path: targetPath,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          if (request.body) {
            body = request.body
            headers['Content-Type'] = contentType
          }
        }
      } else {
        // For JSON and other content types, forward Content-Type header
        if (contentType) {
          headers['Content-Type'] = contentType
        }
        if (contentType?.includes('application/json')) {
          body = await request.text()
        } else {
          body = await request.arrayBuffer()
        }
      }
    }

    // Set timeout based on request type
    const isFileUpload = contentType?.includes('multipart/form-data')
    const timeoutMs = isFileUpload ? 60000 : 30000 // 60s for uploads, 30s for others (Vercel Hobby limit)

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    const fetchOptions: RequestInit = {
      method,
      headers,
      body,
      signal: controller.signal,
    }

    // Add duplex option for streaming uploads
    if (body instanceof ReadableStream) {
      ;(fetchOptions as any).duplex = 'half'
    }

    const response = await fetch(targetUrl, fetchOptions)
    clearTimeout(timeoutId)

    // Log error responses for debugging
    if (!response.ok) {
      const errorText = await response.clone().text()
      console.error('[PROXY] Backend error:', {
        status: response.status,
        path: targetPath,
        method: method,
        error: errorText,
      })
    }

    // Forward response headers
    const responseHeaders = new Headers()
    response.headers.forEach((value, key) => {
      // Skip headers that Next.js handles automatically
      if (
        !['content-encoding', 'content-length', 'transfer-encoding'].includes(
          key.toLowerCase()
        )
      ) {
        responseHeaders.set(key, value)
      }
    })

    const responseBody = await response.arrayBuffer()

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    })
  } catch (error) {
    // Handle timeout and other errors
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 })
    }
    console.error('[PROXY] Request failed:', {
      path: targetPath,
      method: method,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
