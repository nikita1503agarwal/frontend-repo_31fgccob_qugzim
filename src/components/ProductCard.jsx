export default function ProductCard({ product, onAdd }) {
  return (
    <div className="group rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-lg transition-shadow">
      <div className="aspect-square overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/600x600?text=Product'}
          alt={product.title}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium text-gray-900 line-clamp-1">{product.title}</h3>
            <p className="text-sm text-gray-500">{product.category}</p>
          </div>
          <span className="font-semibold text-gray-900">${product.price.toFixed(2)}</span>
        </div>
        {product.sizes?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {product.sizes.slice(0,4).map((s) => (
              <span key={s} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                {s}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={() => onAdd(product)}
          className="mt-4 w-full rounded-lg bg-black text-white py-2 text-sm font-medium hover:bg-gray-900"
        >
          Add to Cart
        </button>
      </div>
    </div>
  )
}
