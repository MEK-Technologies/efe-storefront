🧪 Guía de Pruebas con cURL - Endpoints de Productos
Comandos curl para probar todos los endpoints de productos y variantes.

🚀 Preparación
1. Inicia el servidor:

bash
yarn start
2. Espera a que el servidor esté listo:

Server is ready on port: 9000
📦 1. GET /store/products - Listar Productos
Básico - Listar todos los productos
bash
curl -X GET http://localhost:9000/store/products
Con paginación (limit)
bash
curl -X GET "http://localhost:9000/store/products?limit=5"
Con paginación (limit + offset)
bash
curl -X GET "http://localhost:9000/store/products?limit=10&offset=5"
Filtrar por categoría
bash
# Reemplaza CATEGORY_ID con un ID real de categoría
curl -X GET "http://localhost:9000/store/products?category_id=CATEGORY_ID"
Con autenticación (usando publishable key)
bash
curl -X GET http://localhost:9000/store/products \
  -H "x-publishable-api-key: pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84"
Formato bonito (con jq)
bash
curl -X GET http://localhost:9000/store/products | jq '.'
Ver solo los títulos de productos
bash
curl -X GET http://localhost:9000/store/products | jq '.products[].title'
Ver precios calculados
bash
curl -X GET http://localhost:9000/store/products | jq '.products[].variants[].calculated_price'
🎯 2. GET /store/products/:id - Producto Individual
Obtener un producto específico
bash
# Primero obtén un ID de producto
PRODUCT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].id')
# Luego obtén ese producto
curl -X GET "http://localhost:9000/store/products/$PRODUCT_ID"
Con formato bonito
bash
PRODUCT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].id')
curl -X GET "http://localhost:9000/store/products/$PRODUCT_ID" | jq '.'
Probar con ID inexistente (debe retornar 404)
bash
curl -X GET http://localhost:9000/store/products/prod_nonexistent123 -v
Ver todas las variantes del producto
bash
PRODUCT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].id')
curl -s "http://localhost:9000/store/products/$PRODUCT_ID" | jq '.product.variants'
Ver imágenes del producto
bash
PRODUCT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].id')
curl -s "http://localhost:9000/store/products/$PRODUCT_ID" | jq '.product.images'
Ver categorías del producto
bash
PRODUCT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].id')
curl -s "http://localhost:9000/store/products/$PRODUCT_ID" | jq '.product.categories'
🔍 3. POST /store/products/search - Búsqueda
Búsqueda básica de productos
bash
curl -X POST http://localhost:9000/store/products/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test"
  }'
Búsqueda con tipo de índice específico (productos)
bash
curl -X POST http://localhost:9000/store/products/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "laptop",
    "indexType": "product"
  }'
Búsqueda en categorías
bash
curl -X POST http://localhost:9000/store/products/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "electronics",
    "indexType": "category"
  }'
Búsqueda con formato bonito
bash
curl -X POST http://localhost:9000/store/products/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}' | jq '.'
Probar con query vacío (debe retornar 400)
bash
curl -X POST http://localhost:9000/store/products/search \
  -H "Content-Type: application/json" \
  -d '{"query": ""}' -v
🎨 4. GET /store/variants/:id - Variante Individual
Obtener una variante específica
bash
# Primero obtén un ID de variante
VARIANT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].variants[0].id')
# Luego obtén esa variante
curl -X GET "http://localhost:9000/store/variants/$VARIANT_ID"
Con formato bonito
bash
VARIANT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].variants[0].id')
curl -X GET "http://localhost:9000/store/variants/$VARIANT_ID" | jq '.'
Probar con ID inexistente (debe retornar 404)
bash
curl -X GET http://localhost:9000/store/variants/variant_nonexistent123 -v
Ver precio calculado de la variante
bash
VARIANT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].variants[0].id')
curl -s "http://localhost:9000/store/variants/$VARIANT_ID" | jq '.variant.calculated_price'
Ver información del producto padre
bash
VARIANT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].variants[0].id')
curl -s "http://localhost:9000/store/variants/$VARIANT_ID" | jq '.variant.product'
Ver opciones de la variante (talla, color, etc.)
bash
VARIANT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].variants[0].id')
curl -s "http://localhost:9000/store/variants/$VARIANT_ID" | jq '.variant.options'
Ver inventario de la variante
bash
VARIANT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].variants[0].id')
curl -s "http://localhost:9000/store/variants/$VARIANT_ID" | jq '.variant.inventory_items'
🔐 Pruebas con Autenticación
Listar productos con API key
bash
curl -X GET http://localhost:9000/store/products \
  -H "x-publishable-api-key: pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84"
Producto individual con API key
bash
PRODUCT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].id')
curl -X GET "http://localhost:9000/store/products/$PRODUCT_ID" \
  -H "x-publishable-api-key: pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84"
Variante con API key
bash
VARIANT_ID=$(curl -s http://localhost:9000/store/products | jq -r '.products[0].variants[0].id')
curl -X GET "http://localhost:9000/store/variants/$VARIANT_ID" \
  -H "x-publishable-api-key: pk_5a9adcc55fdce282eeb406d68981da109220bbfd4c9f772b2fa791270301df84"
📊 Script de Prueba Completo
Guarda esto como test-endpoints.sh y ejecútalo:

bash
#!/bin/bash
echo "🧪 Probando Endpoints de Productos"
echo "=================================="
echo ""
# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color
# 1. Listar productos
echo -e "${BLUE}1. GET /store/products${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:9000/store/products)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK (200)${NC}"
    PRODUCT_ID=$(echo "$RESPONSE" | head -n-1 | jq -r '.products[0].id')
    VARIANT_ID=$(echo "$RESPONSE" | head -n-1 | jq -r '.products[0].variants[0].id')
else
    echo -e "${RED}✗ FAIL ($HTTP_CODE)${NC}"
fi
echo ""
# 2. Producto individual
echo -e "${BLUE}2. GET /store/products/:id${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:9000/store/products/$PRODUCT_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK (200)${NC}"
else
    echo -e "${RED}✗ FAIL ($HTTP_CODE)${NC}"
fi
echo ""
# 3. Producto inexistente (debe ser 404)
echo -e "${BLUE}3. GET /store/products/:id (404 test)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:9000/store/products/prod_nonexistent")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ OK (404 as expected)${NC}"
else
    echo -e "${RED}✗ FAIL (expected 404, got $HTTP_CODE)${NC}"
fi
echo ""
# 4. Búsqueda
echo -e "${BLUE}4. POST /store/products/search${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:9000/store/products/search \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK (200)${NC}"
else
    echo -e "${RED}✗ FAIL ($HTTP_CODE)${NC}"
fi
echo ""
# 5. Variante individual
echo -e "${BLUE}5. GET /store/variants/:id${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:9000/store/variants/$VARIANT_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK (200)${NC}"
else
    echo -e "${RED}✗ FAIL ($HTTP_CODE)${NC}"
fi
echo ""
# 6. Variante inexistente (debe ser 404)
echo -e "${BLUE}6. GET /store/variants/:id (404 test)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "http://localhost:9000/store/variants/variant_nonexistent")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "404" ]; then
    echo -e "${GREEN}✓ OK (404 as expected)${NC}"
else
    echo -e "${RED}✗ FAIL (expected 404, got $HTTP_CODE)${NC}"
fi
echo ""
echo "=================================="
echo "✅ Pruebas completadas"
Ejecutar el script:
bash
chmod +x test-endpoints.sh
./test-endpoints.sh
💡 Consejos
Instala jq para formatear JSON:

bash
sudo apt install jq
Ver headers de respuesta con -v:

bash
curl -v http://localhost:9000/store/products
Guardar respuesta en archivo:

bash
curl http://localhost:9000/store/products > response.json
Medir tiempo de respuesta:

bash
curl -w "\nTime: %{time_total}s\n" http://localhost:9000/store/products
Ver solo código HTTP:

bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:9000/store/products

Comment
Ctrl+Alt+M
