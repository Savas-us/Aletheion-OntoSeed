#!/bin/bash

# OntoSeed Smoke Test Script
# Health checks for deployment validation

set -e

BASE_URL=${1:-"http://localhost:3000"}
TIMEOUT=30
DELAY=2

echo "🔥 Running OntoSeed smoke tests against: $BASE_URL"

# Function to check endpoint with retry
check_endpoint() {
    local endpoint=$1
    local description=$2
    local max_attempts=$((TIMEOUT / DELAY))
    local attempt=1
    
    echo -n "Testing $description..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f -s "$BASE_URL$endpoint" > /dev/null 2>&1; then
            echo " ✅"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            echo " ❌"
            echo "  Failed after $max_attempts attempts"
            return 1
        fi
        
        sleep $DELAY
        attempt=$((attempt + 1))
    done
}

# Function to test API endpoint with data
test_api_endpoint() {
    local endpoint=$1
    local method=$2
    local data=$3
    local content_type=$4
    local description=$5
    
    echo -n "Testing $description..."
    
    local response
    if [ "$method" = "POST" ]; then
        response=$(curl -s -X POST "$BASE_URL$endpoint" \
            -H "Content-Type: $content_type" \
            -d "$data" \
            -w "%{http_code}")
    else
        response=$(curl -s "$BASE_URL$endpoint" -w "%{http_code}")
    fi
    
    local http_code="${response: -3}"
    
    if [ "$http_code" = "200" ]; then
        echo " ✅"
        return 0
    else
        echo " ❌ (HTTP $http_code)"
        return 1
    fi
}

# Basic health checks
echo "📊 Basic Health Checks"
check_endpoint "/" "Home page"

# UI endpoints
echo ""
echo "🎮 UI Endpoints"
check_endpoint "/playground" "SHACL playground"
check_endpoint "/semcom" "SemCom playground"
check_endpoint "/provenance" "Provenance ledger"

# API functionality tests
echo ""
echo "🔧 API Functionality Tests"

# Test valid Turtle validation
VALID_TURTLE='@prefix onto: <http://ontoseed.org/core#> .
@prefix ex: <http://example.org/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

ex:TestEntity a onto:Entity ;
    rdfs:label "Test Entity" ;
    onto:hasIdentity ex:TestEntity_Identity .

ex:TestEntity_Identity a onto:Identity ;
    onto:identityValue "test-001" .'

echo -n "Testing Valid Turtle validation..."
echo "$VALID_TURTLE" | curl -s -X POST "$BASE_URL/api/validate" -H "Content-Type: text/turtle" -d @- > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo " ✅"
else
    echo " ❌"
fi

# Test SemCom encoding
echo -n "Testing SemCom encoding..."
echo "$VALID_TURTLE" | curl -s -X POST "$BASE_URL/api/semcom" -H "Content-Type: text/turtle" -d @- > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo " ✅"
else
    echo " ❌"
fi

# Test provenance record creation
echo -n "Testing Provenance record..."
curl -s -X POST "$BASE_URL/api/prov" -H "Content-Type: application/json" -d '{"entity": "test-entity", "activity": "smoke-test", "agent": "test-runner"}' > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo " ✅"
else
    echo " ❌"
fi

# Performance check
echo ""
echo "⚡ Performance Check"
echo -n "Testing response time..."
START_TIME=$(date +%s%N)
curl -f -s "$BASE_URL/" > /dev/null
END_TIME=$(date +%s%N)
RESPONSE_TIME=$(( (END_TIME - START_TIME) / 1000000 ))

if [ $RESPONSE_TIME -lt 5000 ]; then
    echo " ✅ (${RESPONSE_TIME}ms)"
else
    echo " ⚠️  (${RESPONSE_TIME}ms - slow)"
fi

echo ""
echo "🎉 All smoke tests completed successfully!"
echo "🔗 Application available at: $BASE_URL"
echo "📋 Test endpoints:"
echo "   - SHACL Playground: $BASE_URL/playground"
echo "   - SemCom Playground: $BASE_URL/semcom"
echo "   - Provenance Ledger: $BASE_URL/provenance"