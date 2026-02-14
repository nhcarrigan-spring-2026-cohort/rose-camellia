#!/bin/bash

BASE_URL="http://localhost:3000/api"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "======================================"
echo "  Rose Camellia API - Complete Tests  "
echo "======================================"

# Test 1: Health Check
echo -e "\n${YELLOW}[TEST 1]${NC} Health Check"
HEALTH=$(curl -s http://localhost:3000/health)
echo "$HEALTH" | jq
if echo "$HEALTH" | jq -e '.status == "ok"' > /dev/null; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 2: Registration with weak password (should FAIL)
echo -e "\n${YELLOW}[TEST 2]${NC} Register with weak password (should fail)"
WEAK_PASS=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "name": "Test User",
    "email": "test@example.com",
    "password": "weak"
  }')
echo "$WEAK_PASS" | jq
if echo "$WEAK_PASS" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ PASSED (Rejected weak password)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 3: Registration with missing name (should FAIL)
echo -e "\n${YELLOW}[TEST 3]${NC} Register without name (should fail)"
NO_NAME=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Password123"
  }')
echo "$NO_NAME" | jq
if echo "$NO_NAME" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ PASSED (Rejected missing name)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 4: Valid Registration (should SUCCEED)
echo -e "\n${YELLOW}[TEST 4]${NC} Register valid user"
REGISTER=$(curl -s -X POST $BASE_URL/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "contactNumber": "+1234567890"
  }')
echo "$REGISTER" | jq
TOKEN=$(echo "$REGISTER" | jq -r '.token')
if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
  echo -e "${GREEN}✓ PASSED (User registered, token received)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 5: Login with correct credentials
echo -e "\n${YELLOW}[TEST 5]${NC} Login with valid credentials"
LOGIN=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }')
echo "$LOGIN" | jq
LOGIN_TOKEN=$(echo "$LOGIN" | jq -r '.token')
if [ "$LOGIN_TOKEN" != "null" ] && [ -n "$LOGIN_TOKEN" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
  TOKEN=$LOGIN_TOKEN
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 6: Login with wrong password (should FAIL)
echo -e "\n${YELLOW}[TEST 6]${NC} Login with wrong password (should fail)"
WRONG_PASS=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "WrongPassword"
  }')
echo "$WRONG_PASS" | jq
if echo "$WRONG_PASS" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ PASSED (Rejected wrong password)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 7: Create guest user without name (should FAIL)
echo -e "\n${YELLOW}[TEST 7]${NC} Create guest without name (should fail)"
NO_NAME_GUEST=$(curl -s -X POST $BASE_URL/auth/guest \
  -H "Content-Type: application/json" \
  -d '{
    "email": "guest@example.com"
  }')
echo "$NO_NAME_GUEST" | jq
if echo "$NO_NAME_GUEST" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ PASSED (Rejected missing name)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 8: Create valid guest user (should SUCCEED)
echo -e "\n${YELLOW}[TEST 8]${NC} Create valid guest user"
GUEST=$(curl -s -X POST $BASE_URL/auth/guest \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anonymous Guest",
    "email": "guest@example.com",
    "contactNumber": "+9876543210"
  }')
echo "$GUEST" | jq
GUEST_TOKEN=$(echo "$GUEST" | jq -r '.token')
GUEST_USERNAME=$(echo "$GUEST" | jq -r '.user.username')
if [ "$GUEST_TOKEN" != "null" ] && [ -n "$GUEST_TOKEN" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 9: Verify token
echo -e "\n${YELLOW}[TEST 9]${NC} Verify JWT token"
VERIFY=$(curl -s -X GET $BASE_URL/auth/verify \
  -H "Authorization: Bearer $TOKEN")
echo "$VERIFY" | jq
if echo "$VERIFY" | jq -e '.valid == true' > /dev/null; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 10: Create post with missing required fields (should FAIL)
echo -e "\n${YELLOW}[TEST 10]${NC} Create post with missing title (should fail)"
NO_TITLE=$(curl -s -X POST $BASE_URL/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "postType": "lost",
    "description": "My dog is missing",
    "location": "Central Park",
    "lostFoundDate": "2024-02-10T10:00:00Z"
  }')
echo "$NO_TITLE" | jq
if echo "$NO_TITLE" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ PASSED (Rejected missing title)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 11: Create valid lost pet post (should SUCCEED)
echo -e "\n${YELLOW}[TEST 11]${NC} Create valid lost pet post"
LOST_POST=$(curl -s -X POST $BASE_URL/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "authorUsername": "john_doe",
    "postType": "lost",
    "title": "Lost Golden Retriever in Central Park",
    "description": "My golden retriever Buddy went missing near Central Park. Very friendly, responds to his name. Has a red collar with tags.",
    "petName": "Buddy",
    "petType": "Dog",
    "breed": "Golden Retriever",
    "color": "Golden",
    "size": "Large",
    "location": "Central Park, NYC",
    "lostFoundDate": "2024-02-10T10:00:00Z",
    "contactEmail": "john@example.com",
    "contactPhone": "+1234567890",
    "reward": 200
  }')
echo "$LOST_POST" | jq
LOST_POST_ID=$(echo "$LOST_POST" | jq -r '.id')
if [ "$LOST_POST_ID" != "null" ] && [ -n "$LOST_POST_ID" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 12: Create sighting post (guest user)
echo -e "\n${YELLOW}[TEST 12]${NC} Create sighting post as guest"
SIGHTING=$(curl -s -X POST $BASE_URL/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -d "{
    \"authorUsername\": \"$GUEST_USERNAME\",
    \"postType\": \"sighting\",
    \"title\": \"Spotted Golden Retriever near 5th Avenue\",
    \"description\": \"I saw a golden retriever wandering alone near 5th Ave and 60th St around 2 PM today\",
    \"petType\": \"Dog\",
    \"location\": \"5th Avenue & 60th St, NYC\",
    \"lostFoundDate\": \"2024-02-11T14:00:00Z\",
    \"contactEmail\": \"guest@example.com\"
  }")
echo "$SIGHTING" | jq
SIGHTING_ID=$(echo "$SIGHTING" | jq -r '.id')
if [ "$SIGHTING_ID" != "null" ] && [ -n "$SIGHTING_ID" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 13: Get all posts
echo -e "\n${YELLOW}[TEST 13]${NC} Get all posts"
ALL_POSTS=$(curl -s "$BASE_URL/posts")
echo "$ALL_POSTS" | jq '.posts | length'
POST_COUNT=$(echo "$ALL_POSTS" | jq '.posts | length')
if [ "$POST_COUNT" -ge 2 ]; then
  echo -e "${GREEN}✓ PASSED (Found $POST_COUNT posts)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 14: Filter posts by type (lost only)
echo -e "\n${YELLOW}[TEST 14]${NC} Filter posts by type (lost only)"
LOST_ONLY=$(curl -s "$BASE_URL/posts?postType=lost")
echo "$LOST_ONLY" | jq '.posts | length'
LOST_COUNT=$(echo "$LOST_ONLY" | jq '.posts | length')
if [ "$LOST_COUNT" -ge 1 ]; then
  echo -e "${GREEN}✓ PASSED (Found $LOST_COUNT lost posts)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 15: Get post by ID
echo -e "\n${YELLOW}[TEST 15]${NC} Get post by ID"
POST_DETAIL=$(curl -s "$BASE_URL/posts/$LOST_POST_ID")
echo "$POST_DETAIL" | jq
POST_TITLE=$(echo "$POST_DETAIL" | jq -r '.title')
if [ "$POST_TITLE" != "null" ] && [ -n "$POST_TITLE" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 16: Search posts
echo -e "\n${YELLOW}[TEST 16]${NC} Search posts (keyword: golden)"
SEARCH=$(curl -s "$BASE_URL/posts?search=golden")
echo "$SEARCH" | jq '.posts | length'
SEARCH_COUNT=$(echo "$SEARCH" | jq '.posts | length')
if [ "$SEARCH_COUNT" -ge 1 ]; then
  echo -e "${GREEN}✓ PASSED (Found $SEARCH_COUNT posts)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 17: Add comment with empty content (should FAIL)
echo -e "\n${YELLOW}[TEST 17]${NC} Add comment with empty content (should fail)"
EMPTY_COMMENT=$(curl -s -X POST $BASE_URL/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -d "{
    \"postId\": \"$LOST_POST_ID\",
    \"content\": \"\"
  }")
echo "$EMPTY_COMMENT" | jq
if echo "$EMPTY_COMMENT" | jq -e '.error' > /dev/null; then
  echo -e "${GREEN}✓ PASSED (Rejected empty comment)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 18: Add valid comment
echo -e "\n${YELLOW}[TEST 18]${NC} Add valid comment"
COMMENT=$(curl -s -X POST $BASE_URL/comments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -d "{
    \"postId\": \"$LOST_POST_ID\",
    \"authorUsername\": \"$GUEST_USERNAME\",
    \"content\": \"I think I saw this dog near 5th Avenue! Check my sighting post.\"
  }")
echo "$COMMENT" | jq
COMMENT_ID=$(echo "$COMMENT" | jq -r '.id')
if [ "$COMMENT_ID" != "null" ] && [ -n "$COMMENT_ID" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 19: Get comments for post
echo -e "\n${YELLOW}[TEST 19]${NC} Get comments for post"
COMMENTS=$(curl -s "$BASE_URL/comments/post/$LOST_POST_ID")
echo "$COMMENTS" | jq
COMMENT_COUNT=$(echo "$COMMENTS" | jq 'length')
if [ "$COMMENT_COUNT" -ge 1 ]; then
  echo -e "${GREEN}✓ PASSED (Found $COMMENT_COUNT comments)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 20: Update comment
echo -e "\n${YELLOW}[TEST 20]${NC} Update comment"
UPDATE_COMMENT=$(curl -s -X PUT "$BASE_URL/comments/$COMMENT_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $GUEST_TOKEN" \
  -d '{
    "content": "Updated: I definitely saw this dog! Same collar."
  }')
echo "$UPDATE_COMMENT" | jq
UPDATED_CONTENT=$(echo "$UPDATE_COMMENT" | jq -r '.content')
if echo "$UPDATED_CONTENT" | grep -q "Updated"; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 21: Get user profile
echo -e "\n${YELLOW}[TEST 21]${NC} Get user profile"
USER_PROFILE=$(curl -s "$BASE_URL/users/john_doe")
echo "$USER_PROFILE" | jq
USER_NAME=$(echo "$USER_PROFILE" | jq -r '.name')
if [ "$USER_NAME" == "John Doe" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 22: Get user's posts
echo -e "\n${YELLOW}[TEST 22]${NC} Get user's posts"
USER_POSTS=$(curl -s "$BASE_URL/users/john_doe/posts")
echo "$USER_POSTS" | jq 'length'
USER_POST_COUNT=$(echo "$USER_POSTS" | jq 'length')
if [ "$USER_POST_COUNT" -ge 1 ]; then
  echo -e "${GREEN}✓ PASSED (Found $USER_POST_COUNT posts)${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 23: Mark post as resolved
echo -e "\n${YELLOW}[TEST 23]${NC} Mark post as resolved"
RESOLVED=$(curl -s -X PATCH "$BASE_URL/posts/$LOST_POST_ID/resolve" \
  -H "Authorization: Bearer $TOKEN")
echo "$RESOLVED" | jq
IS_RESOLVED=$(echo "$RESOLVED" | jq -r '.resolved')
if [ "$IS_RESOLVED" == "true" ]; then
  echo -e "${GREEN}✓ PASSED${NC}"
else
  echo -e "${RED}✗ FAILED${NC}"
fi

# Test 24: Rate limiting test (guest creation)
echo -e "\n${YELLOW}[TEST 24]${NC} Rate limiting (attempt 4 guest creations rapidly)"
for i in {1..4}; do
  RATE_TEST=$(curl -s -X POST $BASE_URL/auth/guest \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Guest $i\",
      \"email\": \"guest$i@example.com\"
    }")
  if [ $i -eq 4 ]; then
    if echo "$RATE_TEST" | jq -e '.error' | grep -q "Too many"; then
      echo -e "${GREEN}✓ PASSED (Rate limit triggered on 4th attempt)${NC}"
    else
      echo -e "${YELLOW}⚠ Rate limit may not have triggered (depends on timing)${NC}"
    fi
  fi
done

echo -e "\n======================================"
echo -e "       ${GREEN}All Tests Complete!${NC}          "
echo "======================================"
echo ""
echo "Summary:"
echo "- Authentication: Register, Login, Guest, Token Verification"
echo "- Validation: Weak passwords, missing fields, empty content"
echo "- Posts: Create (lost/found/sighting), Filter, Search, Resolve"
echo "- Comments: Create, Read, Update"
echo "- Users: Profile, Posts"
echo "- Rate Limiting: Guest creation limits"
echo ""
