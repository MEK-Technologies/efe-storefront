# Guía de Integración: Sistema de Inventory para Storefront de Medusa

Esta guía explica cómo interactuar con el sistema de inventory de Medusa v2 desde el storefront, incluyendo consultas de stock, validaciones y mejores prácticas.

## 📋 Tabla de Contenidos

1. [Resumen de Arquitectura](#resumen-de-arquitectura)
2. [Entidades del Sistema](#entidades-del-sistema)
3. [API Endpoints](#api-endpoints)
4. [Integración con el Storefront](#integración-con-el-storefront)
5. [Casos de Uso Comunes](#casos-de-uso-comunes)
6. [Manejo de Errores](#manejo-de-errores)
7. [Optimización y Performance](#optimización-y-performance)
8. [Ejemplos de Código](#ejemplos-de-código)

---

## 🏗️ Resumen de Arquitectura

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│   Storefront    │──────▶│  Medusa Backend  │◀──────│  Stock Location │
│   (Frontend)    │ Query │  (Inventory API) │ Check │  (Warehouse)    │
└─────────────────┘       └──────────────────┘       └─────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │  Inventory Item  │
                          │  & Levels        │
                          └──────────────────┘
```

**Flujo de Datos:**
1. El storefront consulta disponibilidad de productos
2. Medusa verifica inventory levels en stock locations
3. Retorna información actualizada de stock para cada variante
4. El storefront usa esta información para mostrar disponibilidad

---

## 📦 Entidades del Sistema

### Inventory Item
```typescript
interface InventoryItem {
  id: string;                    // ID único del inventory item
  sku?: string;                  // SKU del producto (opcional)
  origin_country?: string;       // País de origen
  hs_code?: string;              // Código HS para aduanas
  mid_code?: string;             // Código MID
  weight?: number;               // Peso del item
  length?: number;               // Longitud
  height?: number;               // Altura
  width?: number;                // Ancho
  material?: string;             // Material del producto
  metadata?: Record<string, any>; // Metadata adicional
  created_at: string;            // Fecha de creación
  updated_at: string;            // Fecha de actualización
}
```

### Inventory Level
```typescript
interface InventoryLevel {
  id: string;                    // ID único del level
  inventory_item_id: string;     // ID del inventory item
  location_id: string;           // ID del stock location
  stocked_quantity: number;      // Cantidad total en stock
  reserved_quantity: number;     // Cantidad reservada (carritos, órdenes)
  incoming_quantity: number;     // Cantidad entrante (restock)
  metadata?: Record<string, any>; // Metadata adicional
  created_at: string;            // Fecha de creación
  updated_at: string;            // Fecha de actualización
}
```

### Stock Location
```typescript
interface StockLocation {
  id: string;                    // ID único de la ubicación
  name: string;                  // Nombre del almacén (ej: "European Warehouse")
  address?: {                    // Dirección del almacén
    city?: string;
    country_code?: string;
    address_1?: string;
    postal_code?: string;
  };
  metadata?: Record<string, any>; // Metadata adicional
  created_at: string;            // Fecha de creación
  updated_at: string;            // Fecha de actualización
}
```

### Available Quantity Response
```typescript
interface AvailableQuantity {
  inventory_item_id: string;     // ID del inventory item
  location_id: string;           // ID del stock location
  quantity: number;              // Cantidad disponible (stocked - reserved)
}
```

---

## 🔗 API Endpoints

### 1. Consultar Stock de Productos

**Endpoint:** `GET /store/products/:id`

```typescript
// Respuesta incluye información de inventory
interface ProductWithInventory {
  id: string;
  title: string;
  handle: string;
  variants: Array<{
    id: string;
    title: string;
    sku?: string;
    inventory_items?: Array<{
      inventory_item_id: string;
      required_quantity: number;
      inventory?: {
        location_levels?: Array<{
          location_id: string;
          stocked_quantity: number;
          reserved_quantity: number;
          available_quantity: number;
        }>;
      };
    }>;
  }>;
}
```

### 2. Verificar Disponibilidad Específica

**Endpoint:** `POST /store/inventory-items/availability`

```typescript
// Request body
interface AvailabilityRequest {
  items: Array<{
    inventory_item_id: string;
    required_quantity: number;
    location_id?: string;        // Opcional: ubicación específica
  }>;
  sales_channel_id?: string;     // Canal de ventas
}

// Response
interface AvailabilityResponse {
  availability: Array<{
    inventory_item_id: string;
    location_id: string;
    is_available: boolean;
    available_quantity: number;
    requested_quantity: number;
  }>;
}
```

### 3. Obtener Inventory Items

**Endpoint:** `GET /admin/inventory-items`

```typescript
// Query parameters
interface InventoryItemQuery {
  id?: string | string[];        // IDs específicos
  sku?: string | string[];       // SKUs específicos
  location_id?: string;          // Filtrar por ubicación
  expand?: string;               // Expandir relaciones (levels, locations)
  limit?: number;                // Límite de resultados
  offset?: number;               // Offset para paginación
}
```

---

## 🔌 Integración con el Storefront

### 1. Hook para Consultar Stock

```typescript
// hooks/useInventory.ts
import { useState, useEffect } from 'react';

interface UseInventoryResult {
  availability: AvailabilityResponse | null;
  isLoading: boolean;
  error: string | null;
  checkAvailability: (items: AvailabilityRequest['items']) => Promise<void>;
}

export const useInventory = (): UseInventoryResult => {
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = async (items: AvailabilityRequest['items']) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/store/inventory-items/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items }),
      });

      if (!response.ok) {
        throw new Error('Error checking availability');
      }

      const data = await response.json();
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    availability,
    isLoading,
    error,
    checkAvailability,
  };
};
```

### 2. Componente de Stock Status

```typescript
// components/StockStatus.tsx
import React from 'react';

interface StockStatusProps {
  inventoryItemId: string;
  requiredQuantity?: number;
  className?: string;
}

export const StockStatus: React.FC<StockStatusProps> = ({
  inventoryItemId,
  requiredQuantity = 1,
  className = '',
}) => {
  const { availability, isLoading, checkAvailability } = useInventory();

  useEffect(() => {
    checkAvailability([{
      inventory_item_id: inventoryItemId,
      required_quantity: requiredQuantity,
    }]);
  }, [inventoryItemId, requiredQuantity]);

  if (isLoading) {
    return <div className={`${className} text-gray-500`}>Checking availability...</div>;
  }

  const itemAvailability = availability?.availability.find(
    item => item.inventory_item_id === inventoryItemId
  );

  if (!itemAvailability) {
    return <div className={`${className} text-red-500`}>Availability unknown</div>;
  }

  const getStatusDisplay = () => {
    if (itemAvailability.is_available) {
      if (itemAvailability.available_quantity > 10) {
        return {
          text: 'In Stock',
          className: 'text-green-600',
          icon: '✓'
        };
      } else if (itemAvailability.available_quantity > 0) {
        return {
          text: `Only ${itemAvailability.available_quantity} left`,
          className: 'text-orange-600',
          icon: '⚠️'
        };
      }
    }
    
    return {
      text: 'Out of Stock',
      className: 'text-red-600',
      icon: '✗'
    };
  };

  const status = getStatusDisplay();

  return (
    <div className={`${className} ${status.className} flex items-center gap-1`}>
      <span>{status.icon}</span>
      <span>{status.text}</span>
    </div>
  );
};
```

### 3. Validación de Carrito

```typescript
// utils/cartValidation.ts
export interface CartItem {
  variant_id: string;
  inventory_item_id: string;
  quantity: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    variant_id: string;
    message: string;
    available_quantity: number;
    requested_quantity: number;
  }>;
}

export const validateCartInventory = async (
  items: CartItem[]
): Promise<ValidationResult> => {
  const inventoryItems = items.map(item => ({
    inventory_item_id: item.inventory_item_id,
    required_quantity: item.quantity,
  }));

  const response = await fetch('/store/inventory-items/availability', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: inventoryItems }),
  });

  const data: AvailabilityResponse = await response.json();
  
  const errors: ValidationResult['errors'] = [];

  items.forEach(cartItem => {
    const availability = data.availability.find(
      av => av.inventory_item_id === cartItem.inventory_item_id
    );

    if (!availability?.is_available) {
      errors.push({
        variant_id: cartItem.variant_id,
        message: `Insufficient stock for this item`,
        available_quantity: availability?.available_quantity || 0,
        requested_quantity: cartItem.quantity,
      });
    }
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};
```

---

## 🎯 Casos de Uso Comunes

### 1. Mostrar Disponibilidad en Página de Producto

```typescript
// pages/products/[handle].tsx
export const ProductPage: React.FC<{ product: Product }> = ({ product }) => {
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);

  return (
    <div>
      <h1>{product.title}</h1>
      
      {/* Selector de Variantes */}
      <VariantSelector 
        variants={product.variants}
        selected={selectedVariant}
        onSelect={setSelectedVariant}
      />

      {/* Estado del Stock */}
      <StockStatus 
        inventoryItemId={selectedVariant.inventory_items[0]?.inventory_item_id}
        className="mb-4"
      />

      {/* Botón de Agregar al Carrito */}
      <AddToCartButton 
        variant={selectedVariant}
        disabled={/* basado en disponibilidad */}
      />
    </div>
  );
};
```

### 2. Validación en Tiempo Real del Carrito

```typescript
// components/Cart.tsx
export const Cart: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  useEffect(() => {
    const validateCart = async () => {
      if (cart.length > 0) {
        const result = await validateCartInventory(cart);
        setValidation(result);
      }
    };

    validateCart();
  }, [cart]);

  return (
    <div>
      <h2>Shopping Cart</h2>
      
      {cart.map(item => (
        <div key={item.variant_id} className="cart-item">
          <span>{item.quantity}x Product</span>
          
          {/* Mostrar errores de inventario */}
          {validation?.errors.find(e => e.variant_id === item.variant_id) && (
            <div className="text-red-500 text-sm">
              Only {validation.errors.find(e => e.variant_id === item.variant_id)?.available_quantity} available
            </div>
          )}
        </div>
      ))}

      <button 
        disabled={!validation?.isValid}
        className="checkout-btn"
      >
        {validation?.isValid ? 'Checkout' : 'Fix Cart Issues'}
      </button>
    </div>
  );
};
```

### 3. Notificaciones de Stock Bajo

```typescript
// hooks/useStockAlerts.ts
export const useStockAlerts = (threshold: number = 5) => {
  const [alerts, setAlerts] = useState<string[]>([]);

  const checkStockLevels = async (inventoryItemIds: string[]) => {
    const lowStockItems: string[] = [];

    for (const itemId of inventoryItemIds) {
      const response = await fetch(`/admin/inventory-items/${itemId}?expand=location_levels`);
      const item = await response.json();

      const totalStock = item.location_levels?.reduce(
        (sum: number, level: any) => sum + level.available_quantity, 0
      ) || 0;

      if (totalStock <= threshold && totalStock > 0) {
        lowStockItems.push(itemId);
      }
    }

    setAlerts(lowStockItems);
  };

  return { alerts, checkStockLevels };
};
```

---

## ⚠️ Manejo de Errores

### Tipos de Errores Comunes

```typescript
enum InventoryErrorType {
  ITEM_NOT_FOUND = 'INVENTORY_ITEM_NOT_FOUND',
  LOCATION_NOT_FOUND = 'STOCK_LOCATION_NOT_FOUND',
  INSUFFICIENT_STOCK = 'INSUFFICIENT_STOCK',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

interface InventoryError {
  type: InventoryErrorType;
  message: string;
  details?: any;
}
```

### Error Handler

```typescript
// utils/errorHandler.ts
export const handleInventoryError = (error: any): InventoryError => {
  if (error.response?.status === 404) {
    return {
      type: InventoryErrorType.ITEM_NOT_FOUND,
      message: 'Inventory item not found',
      details: error.response.data,
    };
  }

  if (error.response?.status === 400) {
    return {
      type: InventoryErrorType.INSUFFICIENT_STOCK,
      message: 'Insufficient stock for requested quantity',
      details: error.response.data,
    };
  }

  return {
    type: InventoryErrorType.NETWORK_ERROR,
    message: 'Network error occurred',
    details: error.message,
  };
};
```

---

## ⚡ Optimización y Performance

### 1. Caching de Consultas

```typescript
// utils/inventoryCache.ts
class InventoryCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private readonly TTL = 30000; // 30 segundos

  async get<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: Date.now() });
    
    return data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const inventoryCache = new InventoryCache();
```

### 2. Batch Requests

```typescript
// utils/batchInventory.ts
export const batchInventoryCheck = async (
  inventoryItemIds: string[]
): Promise<Record<string, AvailableQuantity[]>> => {
  // Agrupar múltiples consultas en una sola request
  const items = inventoryItemIds.map(id => ({
    inventory_item_id: id,
    required_quantity: 1,
  }));

  const response = await fetch('/store/inventory-items/availability', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });

  const data: AvailabilityResponse = await response.json();
  
  // Organizar por inventory_item_id para fácil acceso
  return data.availability.reduce((acc, item) => {
    if (!acc[item.inventory_item_id]) {
      acc[item.inventory_item_id] = [];
    }
    acc[item.inventory_item_id].push(item);
    return acc;
  }, {} as Record<string, AvailableQuantity[]>);
};
```

### 3. WebSocket Updates

```typescript
// utils/inventoryWebSocket.ts
export const subscribeToInventoryUpdates = (
  inventoryItemIds: string[],
  onUpdate: (update: InventoryUpdate) => void
) => {
  const ws = new WebSocket(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:9000/ws');

  ws.onopen = () => {
    // Suscribirse a actualizaciones de inventory
    ws.send(JSON.stringify({
      type: 'subscribe',
      entity: 'inventory_level',
      filters: { inventory_item_id: inventoryItemIds },
    }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'inventory_level.updated') {
      onUpdate(data.payload);
    }
  };

  return () => ws.close();
};
```

---

## 📚 Ejemplos de Código Completos

### E-commerce Store Page

```typescript
// components/ProductGrid.tsx
interface ProductGridProps {
  products: Product[];
}

export const ProductGrid: React.FC<ProductGridProps> = ({ products }) => {
  const [inventoryData, setInventoryData] = useState<Record<string, any>>({});

  useEffect(() => {
    // Obtener todos los inventory items de los productos
    const inventoryItemIds = products.flatMap(product => 
      product.variants.flatMap(variant => 
        variant.inventory_items?.map(item => item.inventory_item_id) || []
      )
    );

    // Consulta batch para obtener disponibilidad
    batchInventoryCheck(inventoryItemIds).then(setInventoryData);
  }, [products]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard 
          key={product.id}
          product={product}
          inventoryData={inventoryData}
        />
      ))}
    </div>
  );
};

interface ProductCardProps {
  product: Product;
  inventoryData: Record<string, any>;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, inventoryData }) => {
  const firstVariant = product.variants[0];
  const inventoryItemId = firstVariant?.inventory_items?.[0]?.inventory_item_id;
  const availability = inventoryData[inventoryItemId || ''];

  const isInStock = availability?.some((item: any) => item.is_available) ?? false;
  const totalStock = availability?.reduce((sum: number, item: any) => 
    sum + item.available_quantity, 0) ?? 0;

  return (
    <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
      <img 
        src={product.thumbnail || '/placeholder.jpg'} 
        alt={product.title}
        className="w-full h-48 object-cover rounded mb-4"
      />
      
      <h3 className="font-semibold mb-2">{product.title}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      
      <div className="flex justify-between items-center">
        <span className="font-bold">
          ${firstVariant?.prices?.[0]?.amount / 100}
        </span>
        
        <div className="flex items-center gap-2">
          {isInStock ? (
            <span className="text-green-600 text-sm">
              {totalStock > 10 ? 'In Stock' : `${totalStock} left`}
            </span>
          ) : (
            <span className="text-red-600 text-sm">Out of Stock</span>
          )}
          
          <button 
            disabled={!isInStock}
            className={`px-4 py-2 rounded ${
              isInStock 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};
```

### Checkout Flow con Validación

```typescript
// components/CheckoutForm.tsx
export const CheckoutForm: React.FC = () => {
  const [cart] = useCart();
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateBeforeCheckout = async () => {
    setIsValidating(true);
    
    try {
      const cartItems = cart.items.map(item => ({
        variant_id: item.variant.id,
        inventory_item_id: item.variant.inventory_items[0].inventory_item_id,
        quantity: item.quantity,
      }));

      const result = await validateCartInventory(cartItems);
      setValidation(result);

      if (result.isValid) {
        // Proceder con el checkout
        window.location.href = '/checkout';
      }
    } catch (error) {
      console.error('Validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Review Your Order</h2>

      {cart.items.map(item => (
        <div key={item.id} className="border-b py-4">
          <div className="flex justify-between">
            <span>{item.variant.title}</span>
            <span>{item.quantity}x ${item.unit_price / 100}</span>
          </div>

          {validation?.errors.find(e => e.variant_id === item.variant.id) && (
            <div className="text-red-500 text-sm mt-2">
              ⚠️ Only {validation.errors.find(e => e.variant_id === item.variant.id)?.available_quantity} in stock
            </div>
          )}
        </div>
      ))}

      <div className="mt-6">
        <div className="flex justify-between font-bold">
          <span>Total: ${cart.total / 100}</span>
        </div>

        {validation && !validation.isValid && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            Please adjust quantities for out-of-stock items
          </div>
        )}

        <button 
          onClick={validateBeforeCheckout}
          disabled={isValidating || (validation && !validation.isValid)}
          className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 disabled:bg-gray-400"
        >
          {isValidating ? 'Validating...' : 'Proceed to Checkout'}
        </button>
      </div>
    </div>
  );
};
```

---

## 🔧 Configuración del Proyecto

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_WS_URL=ws://localhost:9000/ws
NEXT_PUBLIC_INVENTORY_CACHE_TTL=30000
```

### Package Dependencies

```json
{
  "dependencies": {
    "@medusajs/js-sdk": "^2.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
```

---

## 🚀 Despliegue y Consideraciones de Producción

### 1. Rate Limiting

```typescript
// Implementar throttling para consultas de inventory
const throttledInventoryCheck = throttle(checkAvailability, 1000);
```

### 2. Error Fallbacks

```typescript
// Fallback cuando el servicio de inventory no está disponible
const FALLBACK_STOCK_STATUS = {
  isAvailable: true,
  message: "Stock information temporarily unavailable",
  showAsInStock: false,
};
```

### 3. Monitoring

```typescript
// Logging de eventos de inventory para debugging
const logInventoryEvent = (event: string, data: any) => {
  console.log(`[Inventory] ${event}:`, data);
  // Enviar a servicio de monitoring (DataDog, Sentry, etc.)
};
```

---

## 📖 Referencias

- [Medusa Inventory Module Documentation](https://docs.medusajs.com/resources/commerce-modules/inventory)
- [Stock Location Module](https://docs.medusajs.com/resources/commerce-modules/stock-location)
- [Admin API Reference](https://docs.medusajs.com/api/admin)
- [Store API Reference](https://docs.medusajs.com/api/store)

---

## 🎯 Conclusión

Esta guía proporciona una base sólida para integrar el sistema de inventory de Medusa v2 en el storefront. Las implementaciones mostradas cubren:

- ✅ Consultas de disponibilidad en tiempo real
- ✅ Validación de carrito antes del checkout
- ✅ Manejo de errores y estados de carga
- ✅ Optimizaciones de performance
- ✅ Componentes reutilizables

Para implementaciones más avanzadas, considera integrar WebSockets para actualizaciones en tiempo real, implementar reservas temporales de stock, y manejar múltiples stock locations para envíos regionales.