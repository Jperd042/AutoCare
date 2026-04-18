'use client'

import { useEffect, useMemo, useState, useSyncExternalStore } from 'react'
import { ArrowUpDown, CheckCircle2, Minus, Package, Plus, Search, ShoppingCart, Trash2, X } from 'lucide-react'
import * as shared from '@autocare/shared'
import * as operationsStoreHooks from '@/hooks/useOperationsStore.js'

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'name-asc', label: 'Name A-Z' },
]

const EMPTY_CHECKOUT_STATE = {
  status: 'idle',
  error: null,
  receipt: null,
}

function isPublishedProduct(product) {
  return !product?.status || product.status === 'published'
}

function subscribeCatalog(listener) {
  if (typeof shared.subscribeOperations === 'function') {
    return shared.subscribeOperations(listener)
  }

  return () => {}
}

function getPublishedCatalogSnapshot() {
  if (typeof shared.getPublishedCatalogProductsSnapshot === 'function') {
    return shared.getPublishedCatalogProductsSnapshot()
  }

  if (typeof shared.getInventoryProductsSnapshot === 'function') {
    return shared.getInventoryProductsSnapshot().filter(isPublishedProduct)
  }

  return []
}

function getCatalogCategoriesSnapshot() {
  if (typeof shared.getCatalogCategoriesSnapshot === 'function') {
    return shared.getCatalogCategoriesSnapshot()
  }

  return Array.from(
    new Set(
      getPublishedCatalogSnapshot()
        .map((product) => product.category)
        .filter(Boolean)
    )
  )
}

const usePublishedCatalogProducts =
  typeof operationsStoreHooks.usePublishedCatalogProducts === 'function'
    ? operationsStoreHooks.usePublishedCatalogProducts
    : function usePublishedCatalogProductsFallback() {
        return useSyncExternalStore(
          subscribeCatalog,
          getPublishedCatalogSnapshot,
          getPublishedCatalogSnapshot
        )
      }

const useCatalogCategories =
  typeof operationsStoreHooks.useCatalogCategories === 'function'
    ? operationsStoreHooks.useCatalogCategories
    : function useCatalogCategoriesFallback() {
        return useSyncExternalStore(
          subscribeCatalog,
          getCatalogCategoriesSnapshot,
          getCatalogCategoriesSnapshot
        )
      }

function getProductTimestamp(product) {
  const source = product?.publishedAt ?? product?.createdAt
  const timestamp = source ? new Date(source).getTime() : Number.NaN

  return Number.isFinite(timestamp) ? timestamp : 0
}

function sortProducts(products, sortBy) {
  return [...products].sort((left, right) => {
    if (sortBy === 'price-low') return left.price - right.price
    if (sortBy === 'price-high') return right.price - left.price
    if (sortBy === 'name-asc') return left.name.localeCompare(right.name)

    return getProductTimestamp(right) - getProductTimestamp(left)
  })
}

function reconcileCart(cart, productsById) {
  return Object.entries(cart).reduce((nextCart, [productId, quantity]) => {
    const product = productsById.get(productId)

    if (!product) {
      return nextCart
    }

    const safeQuantity = Math.max(0, Math.min(Number(quantity) || 0, product.stock))

    if (safeQuantity > 0) {
      nextCart[productId] = safeQuantity
    }

    return nextCart
  }, {})
}

function CartDrawer({ cart, productsById, onClose, onUpdateQty, onRemove, onCheckout }) {
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutState, setCheckoutState] = useState(EMPTY_CHECKOUT_STATE)
  const [checkoutForm, setCheckoutForm] = useState({
    customer: '',
    contact: '',
    notes: '',
  })

  const cartItems = Object.entries(cart)
    .map(([productId, quantity]) => {
      const product = productsById.get(productId)

      if (!product || quantity <= 0) {
        return null
      }

      return { ...product, qty: quantity }
    })
    .filter(Boolean)

  const totalItems = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)

  async function handleCheckout() {
    try {
      const receipt = await onCheckout(checkoutForm)
      setCheckoutState({
        status: 'success',
        error: null,
        receipt,
      })
    } catch (error) {
      setCheckoutState({
        status: 'error',
        error: error.message || 'Unable to complete checkout.',
        receipt: null,
      })
    }
  }

  if (checkoutState.status === 'success') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e' }}
        >
          <CheckCircle2 size={28} className="text-emerald-400" />
        </div>
        <p className="text-base font-bold text-ink-primary">Checkout Complete!</p>
        <p className="text-sm text-ink-secondary">
          {checkoutState.receipt?.id
            ? `Receipt ${checkoutState.receipt.id} updated shared inventory stock.`
            : 'Shared inventory stock was updated for this checkout.'}
        </p>
        <button type="button" onClick={onClose} className="btn-ghost mt-2">
          Close
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col" aria-label="Shopping cart drawer">
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
        <p className="flex items-center gap-2 font-bold text-ink-primary">
          <ShoppingCart size={17} style={{ color: '#f07c00' }} />
          Cart ({totalItems} items)
        </p>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-surface-hover"
          aria-label="Close cart"
        >
          <X size={18} />
        </button>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-ink-muted">
          <Package size={40} className="opacity-30" />
          <p className="text-sm">Your cart is empty</p>
        </div>
      ) : !showCheckout ? (
        <>
          <ul className="flex-1 divide-y divide-surface-border overflow-y-auto">
            {cartItems.map((item) => {
              const maxReached = item.qty >= item.stock

              return (
                <li key={item.id} className="px-5 py-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold leading-snug text-ink-primary">{item.name}</p>
                      <p className="text-xs text-ink-muted">{item.category}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="p-1 text-ink-dim transition-colors hover:text-red-400"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-surface-border">
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.qty - 1)}
                        className="px-2.5 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-hover"
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-ink-primary">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => onUpdateQty(item.id, item.qty + 1)}
                        disabled={maxReached}
                        className="px-2.5 py-1.5 text-sm text-ink-muted transition-colors hover:bg-surface-hover disabled:opacity-40"
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-ink-primary">PHP {(item.price * item.qty).toLocaleString()}</p>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="space-y-3 border-t border-surface-border p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-ink-secondary">Subtotal</p>
              <p className="text-lg font-extrabold text-ink-primary">PHP {subtotal.toLocaleString()}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowCheckout(true)}
              className="btn-primary w-full justify-center py-3"
            >
              Proceed to Invoice Checkout
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 space-y-4 overflow-y-auto p-5">
            <button
              type="button"
              onClick={() => setShowCheckout(false)}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink-secondary"
            >
              Back to Cart
            </button>
            <p className="font-bold text-ink-primary">Checkout Details</p>

            <div>
              <label htmlFor="shop-checkout-customer" className="label">
                Customer Name
              </label>
              <input
                id="shop-checkout-customer"
                value={checkoutForm.customer}
                onChange={(event) =>
                  setCheckoutForm((current) => ({ ...current, customer: event.target.value }))
                }
                placeholder="Full name"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="shop-checkout-contact" className="label">
                Contact / Email
              </label>
              <input
                id="shop-checkout-contact"
                value={checkoutForm.contact}
                onChange={(event) =>
                  setCheckoutForm((current) => ({ ...current, contact: event.target.value }))
                }
                placeholder="09xx / email"
                className="input"
              />
            </div>
            <div>
              <label htmlFor="shop-checkout-notes" className="label">
                Notes
              </label>
              <textarea
                id="shop-checkout-notes"
                value={checkoutForm.notes}
                onChange={(event) =>
                  setCheckoutForm((current) => ({ ...current, notes: event.target.value }))
                }
                rows={2}
                className="input resize-none"
                placeholder="Optional order notes..."
              />
            </div>

            <div className="space-y-1.5 rounded-xl border border-surface-border p-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between text-xs text-ink-secondary">
                  <span>{item.name} x{item.qty}</span>
                  <span>PHP {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <div className="mt-2 flex justify-between border-t border-surface-border pt-2 text-sm font-bold text-ink-primary">
                <span>Total</span>
                <span style={{ color: '#f07c00' }}>PHP {subtotal.toLocaleString()}</span>
              </div>
            </div>
            {checkoutState.error ? (
              <p className="text-sm font-medium text-red-400">{checkoutState.error}</p>
            ) : null}
          </div>

          <div className="border-t border-surface-border p-5">
            <button
              type="button"
              onClick={handleCheckout}
              className="btn-primary w-full justify-center py-3"
            >
              <CheckCircle2 size={15} /> Complete Checkout
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function Shop() {
  const products = usePublishedCatalogProducts()
  const sharedCategories = useCatalogCategories()
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products]
  )
  const categories = useMemo(
    () => ['All', ...sharedCategories.filter(Boolean)],
    [sharedCategories]
  )

  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    setCart((current) => reconcileCart(current, productsById))
  }, [productsById])

  useEffect(() => {
    if (!categories.includes(catFilter)) {
      setCatFilter('All')
    }
  }, [categories, catFilter])

  const cartCount = Object.values(cart).reduce((sum, quantity) => sum + quantity, 0)

  function addToCart(productId) {
    const product = productsById.get(productId)

    if (!product || product.stock === 0) {
      return
    }

    setCart((current) => {
      const nextQuantity = Math.min((current[productId] || 0) + 1, product.stock)
      return {
        ...current,
        [productId]: nextQuantity,
      }
    })
  }

  function updateQty(productId, quantity) {
    const product = productsById.get(productId)

    if (!product) {
      setCart((current) => {
        const { [productId]: _removed, ...rest } = current
        return rest
      })
      return
    }

    const clampedQuantity = Math.min(Math.max(quantity, 0), product.stock)

    if (clampedQuantity <= 0) {
      setCart((current) => {
        const { [productId]: _removed, ...rest } = current
        return rest
      })
      return
    }

    setCart((current) => ({ ...current, [productId]: clampedQuantity }))
  }

  function removeFromCart(productId) {
    setCart((current) => {
      const { [productId]: _removed, ...rest } = current
      return rest
    })
  }

  async function handleCheckout(checkoutForm) {
    const reconciledCart = reconcileCart(cart, productsById)
    const items = Object.entries(reconciledCart).map(([productId, quantity]) => ({
      productId,
      quantity,
    }))

    if (items.length === 0) {
      throw new Error('Cart must contain at least one item.')
    }

    if (typeof shared.checkoutCart !== 'function') {
      throw new Error('Shared checkout is unavailable.')
    }

    const customerId =
      checkoutForm.contact.trim() ||
      checkoutForm.customer.trim() ||
      'web-shop-customer'

    const receipt = shared.checkoutCart({
      customerId,
      items,
    })

    setCart({})
    return receipt
  }

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const visibleProducts = products
      .filter((product) => catFilter === 'All' || product.category === catFilter)
      .filter((product) => product.name.toLowerCase().includes(normalizedQuery))

    return sortProducts(visibleProducts, sortBy)
  }, [products, catFilter, query, sortBy])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-[200px] max-w-xs flex-1 items-center gap-2 rounded-lg border border-surface-border bg-surface-card px-3 py-2">
          <Search size={14} className="flex-shrink-0 text-ink-muted" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search products..."
            aria-label="Search products"
            className="w-full bg-transparent text-sm text-ink-secondary outline-none placeholder-ink-muted"
          />
        </label>

        <label className="flex items-center gap-2 rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-sm text-ink-secondary">
          <ArrowUpDown size={14} className="text-ink-muted" />
          <span className="sr-only">Sort products</span>
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort products"
            className="bg-transparent text-sm text-ink-secondary outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCatFilter(category)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all ${
                catFilter === category
                  ? 'border-transparent text-white'
                  : 'border-surface-border text-ink-secondary hover:bg-surface-hover'
              }`}
              style={
                catFilter === category
                  ? { backgroundColor: '#f07c00', borderColor: '#f07c00' }
                  : {}
              }
            >
              {category}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCartOpen(true)}
          className="btn-primary relative ml-auto"
          aria-label="Cart"
        >
          <ShoppingCart size={15} /> Cart
          {cartCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
              {cartCount}
            </span>
          ) : null}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredProducts.map((product) => {
          const inCart = cart[product.id] || 0
          const isOutOfStock = product.stock === 0
          const isLowStock = !isOutOfStock && product.stock < 10
          const isAtStockLimit = inCart >= product.stock

          return (
            <div
              key={product.id}
              className="card flex flex-col gap-3 p-4 transition-colors hover:bg-surface-hover"
            >
              <div
                className="relative flex h-28 w-full flex-col items-center justify-center gap-1 rounded-lg"
                style={{ background: 'linear-gradient(135deg,rgba(240,124,0,0.05),rgba(201,149,26,0.05))' }}
              >
                <Package size={36} className="text-ink-dim opacity-50" />
                {isOutOfStock ? (
                  <span className="badge badge-red absolute right-2 top-2 text-[10px]">Out of Stock</span>
                ) : isLowStock ? (
                  <span className="badge badge-red absolute right-2 top-2 text-[10px]">Low Stock</span>
                ) : null}
              </div>

              <div>
                <p
                  data-testid="shop-product-title"
                  className="text-sm font-semibold leading-snug text-ink-primary"
                >
                  {product.name}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  {product.category} · {product.sku || 'No SKU'}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <p className="text-base font-extrabold" style={{ color: '#f07c00' }}>
                  PHP {product.price.toLocaleString()}
                </p>
                <p className="text-xs text-ink-muted">
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} in stock`}
                </p>
              </div>

              {inCart > 0 ? (
                <div className="flex items-center justify-between overflow-hidden rounded-lg border border-surface-border">
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, inCart - 1)}
                    className="px-3 py-2 text-ink-muted transition-colors hover:bg-surface-hover"
                    aria-label={`Decrease ${product.name} quantity`}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="text-sm font-bold text-ink-primary">{inCart}</span>
                  <button
                    type="button"
                    onClick={() => updateQty(product.id, inCart + 1)}
                    disabled={isAtStockLimit}
                    className="px-3 py-2 text-ink-muted transition-colors hover:bg-surface-hover disabled:opacity-40"
                    aria-label={`Increase ${product.name} quantity`}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => addToCart(product.id)}
                  disabled={isOutOfStock}
                  aria-label={`Add ${product.name} to cart`}
                  className="btn-primary w-full justify-center py-2 text-xs disabled:opacity-40"
                >
                  <Plus size={13} /> {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
              )}
            </div>
          )
        })}
      </div>

      {cartOpen ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/60" onClick={() => setCartOpen(false)} />
          <div className="animate-slide-in-right fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col border-l border-surface-border bg-surface-raised shadow-card-md">
            <CartDrawer
              cart={cart}
              productsById={productsById}
              onClose={() => setCartOpen(false)}
              onUpdateQty={updateQty}
              onRemove={removeFromCart}
              onCheckout={handleCheckout}
            />
          </div>
        </>
      ) : null}
    </div>
  )
}
