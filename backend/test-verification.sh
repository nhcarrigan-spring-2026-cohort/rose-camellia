#!/bin/bash

BASE_URL="http://localhost:3000/api"

echo "=== Testing Verification Code System ==="

# 1. Create a lost pet post
echo -e "\n1. Creating lost pet post..."
POST_RESPONSE=$(curl -s -X POST $BASE_URL/posts \
  -H "Content-Type: application/json" \
  -d '{
    "authorUsername": "testowner",
    "postType": "lost",
    "title": "Lost Husky in Downtown",
    "description": "My husky escaped from my yard. Very friendly but scared.",
    "petName": "Luna",
    "petType": "Dog",
    "breed": "Siberian Husky",
    "location": "Downtown Seattle",
    "lostFoundDate": "2024-02-13T10:00:00Z"
  }')

echo "$POST_RESPONSE" | jq
POST_ID=$(echo "$POST_RESPONSE" | jq -r '.id')
VERIFICATION_CODE=$(echo "$POST_RESPONSE" | jq -r '.verificationCode')

echo -e "\n✅ Post created with verification code: $VERIFICATION_CODE"
echo "   Save this code to share with finder!"

# 2. Try to verify with wrong code
echo -e "\n2. Testing WRONG verification code..."
WRONG_VERIFY=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/verify" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "WRONG1"
  }')

echo "$WRONG_VERIFY" | jq
echo -e "   Expected: Verification failed ❌"

# 3. Verify with correct code
echo -e "\n3. Testing CORRECT verification code..."
CORRECT_VERIFY=$(curl -s -X POST "$BASE_URL/posts/$POST_ID/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"code\": \"$VERIFICATION_CODE\"
  }")

echo "$CORRECT_VERIFY" | jq
echo -e "   Expected: Verification successful ✅"

# 4. Get verification code (as owner)
echo -e "\n4. Retrieving verification code (as owner)..."
GET_CODE=$(curl -s "$BASE_URL/posts/$POST_ID/verification-code?username=testowner")
echo "$GET_CODE" | jq

# 5. Try to get code as non-owner (should fail)
echo -e "\n5. Trying to get code as non-owner (should fail)..."
UNAUTHORIZED=$(curl -s "$BASE_URL/posts/$POST_ID/verification-code?username=someone_else")
echo "$UNAUTHORIZED" | jq

echo -e "\n=== Verification Tests Complete ==="
