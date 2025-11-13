import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function ProductCard({ product, onAdd }) {
  return (
    <div className="group rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition-all">
      <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-gray-400">No image</div>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{product.title}</h3>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-semibold">${product.price.toFixed(2)}</span>
          <button
            onClick={() => onAdd(product)}
            className="inline-flex items-center rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-800"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  )
}

function CartDrawer({ open, onClose, cart, onUpdateQty, onCheckout }) {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0)
  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transition-transform ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Your cart</h2>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">Close</button>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-180px)]">
          {cart.length === 0 && <p className="text-sm text-gray-500">Your cart is empty.</p>}
          {cart.map((item) => (
            <div key={item._key} className="flex items-center gap-3">
              <img src={item.image} alt="" className="h-16 w-16 rounded object-cover bg-gray-100" />
              <div className="flex-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-gray-500">Size: {item.size}</p>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => onUpdateQty(item._key, Math.max(1, item.quantity - 1))} className="h-7 w-7 rounded border">-</button>
                  <span className="text-sm w-6 text-center">{item.quantity}</span>
                  <button onClick={() => onUpdateQty(item._key, item.quantity + 1)} className="h-7 w-7 rounded border">+</button>
                </div>
              </div>
              <div className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Subtotal</span>
            <span className="font-medium">${subtotal.toFixed(2)}</span>
          </div>
          <button onClick={onCheckout} className="w-full rounded-md bg-gray-900 py-2 text-white hover:bg-gray-800">Checkout</button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const [products, setProducts] = useState([])
  const [category, setCategory] = useState('')
  const [cartOpen, setCartOpen] = useState(false)
  const [cart, setCart] = useState([])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products?featured=true`)
        if (!res.ok) throw new Error('Failed to load products')
        const data = await res.json()
        setProducts(data)
      } catch (e) {
        console.error(e)
      }
    }
    fetchProducts()
  }, [])

  const seedIfEmpty = async () => {
    const res = await fetch(`${API_BASE}/api/seed`, { method: 'POST' })
    const data = await res.json()
    // Reload
    const productsRes = await fetch(`${API_BASE}/api/products?featured=true`)
    const productsData = await productsRes.json()
    setProducts(productsData)
    return data
  }

  const addToCart = (product) => {
    const size = product.sizes?.[0] || 'M'
    const itemKey = `${product.title}-${size}`
    setCart((prev) => {
      const exists = prev.find((i) => i._key === itemKey)
      if (exists) {
        return prev.map((i) => i._key === itemKey ? { ...i, quantity: i.quantity + 1 } : i)
      }
      return [
        ...prev,
        {
          _key: itemKey,
          product_id: product._id || '',
          title: product.title,
          price: product.price,
          size,
          quantity: 1,
          image: product.images?.[0] || ''
        }
      ]
    })
    setCartOpen(true)
  }

  const updateQty = (key, qty) => {
    setCart((prev) => prev.map((i) => i._key === key ? { ...i, quantity: qty } : i))
  }

  const checkout = async () => {
    if (cart.length === 0) return
    const subtotal = cart.reduce((acc, i) => acc + i.price * i.quantity, 0)
    const shipping = subtotal > 100 ? 0 : 7.5
    const total = subtotal + shipping
    const payload = {
      customer_name: 'Guest',
      customer_email: 'guest@example.com',
      shipping_address: 'N/A',
      items: cart.map(({ title, price, size, quantity, product_id, image }) => ({ title, price, size, quantity, product_id, image })),
      subtotal,
      shipping,
      total
    }
    try {
      const res = await fetch(`${API_BASE}/api/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      setCart([])
      alert(`Order placed! ID: ${data.id}`)
      setCartOpen(false)
    } catch (e) {
      alert('Checkout failed')
    }
  }

  const categories = ['All', 'Tops', 'Outerwear', 'Bottoms', 'Dresses']

  const filtered = category && category !== 'All' ? products.filter(p => p.category === category) : products

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gray-900" />
            <span className="text-lg font-semibold">BlueWear</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`hover:text-gray-900 ${category === c ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>{c}</button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setCartOpen(true)} className="relative rounded-full border px-3 py-1.5 text-sm">
              Cart
              {cart.length > 0 && <span className="absolute -right-2 -top-2 h-5 w-5 rounded-full bg-gray-900 text-white text-xs grid place-items-center">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <section className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 rounded-2xl bg-gray-900 text-white p-8 md:p-12">
          <div>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">Elevate your everyday fit.</h1>
            <p className="mt-4 text-gray-300 max-w-prose">Minimalist designs. Premium fabrics. Thoughtful details. Discover pieces that move with you, from weekday hustle to weekend unwind.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#shop" className="inline-flex items-center rounded-md bg-white px-4 py-2 text-gray-900 font-medium">Shop now</a>
              <button onClick={seedIfEmpty} className="inline-flex items-center rounded-md border border-white/20 px-4 py-2 font-medium hover:bg-white/10">Seed demo products</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2 aspect-[4/3] rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1513384312027-9fa69a360337?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxIZXJvfGVufDB8MHx8fDE3NjMwMjc4MTZ8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80" alt="Hero" className="h-full w-full object-cover" />
            </div>
            <div className="aspect-square rounded-xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800" alt="Hero side" className="h-full w-full object-cover" />
            </div>
          </div>
        </section>

        <section id="shop" className="mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-semibold">Featured products</h2>
            <div className="md:hidden">
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-md border px-3 py-2 text-sm">
                {categories.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => (
              <ProductCard key={p.title} product={p} onAdd={addToCart} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center rounded-xl border p-10 text-center">
                <p className="text-gray-600">No products yet.</p>
                <button onClick={seedIfEmpty} className="mt-4 rounded-md bg-gray-900 px-4 py-2 text-white">Seed demo products</button>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="mt-16 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-gray-500 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} BlueWear. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-900">Privacy</a>
            <a href="#" className="hover:text-gray-900">Terms</a>
            <a href="#" className="hover:text-gray-900">Support</a>
          </div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} onUpdateQty={updateQty} onCheckout={checkout} />
    </div>
  )
}

export default App
