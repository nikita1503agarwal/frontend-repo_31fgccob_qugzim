export default function CartDrawer({ open, items, onClose }) {
  const subtotal = items.reduce((sum, i) => sum + i.price * (i.quantity || 1), 0)

  return (
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`} aria-hidden={!open}>
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Your Cart</h2>
          <button onClick={onClose} className="p-2 rounded hover:bg-gray-100" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-200px)]">
          {items.length === 0 ? (
            <p className="text-gray-500">Your cart is empty.</p>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <img src={item.images?.[0]} alt={item.title} className="w-16 h-16 rounded object-cover" />
                <div className="flex-1">
                  <h4 className="font-medium line-clamp-1">{item.title}</h4>
                  <p className="text-sm text-gray-500">{item.size || item.category}</p>
                  <p className="text-sm">Qty: {item.quantity || 1}</p>
                </div>
                <span className="font-medium">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="font-semibold">${subtotal.toFixed(2)}</span>
          </div>
          <button className="w-full rounded-lg bg-black text-white py-2 font-medium hover:bg-gray-900">
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}
