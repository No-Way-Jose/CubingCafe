# CubingCafe GraphQL documentation

A sandbox for playing around with GraphQL can be found here [link](https://thecubingcafe.herokuapp.com/graphql/). At the top right corner you will also find some interactive docs that contain more detailed type definitions. This document aims to simplify some type definitions that are commonly found throughout different queries and provide some query examples of varying complexities.

GraphQL is built on top of POST requests using the request body in the following manner:
- query: (String!) string of the GraphQL query
- variables: (Object) key value pair for any variables that may be included in the query string
- operationName: (String) string of the target operation in the query string

Our GraphQL API has two operation types `query` (like `GET`) and `mutation` (like `POST` or `PATCH`)

Each operation type has various underlying operations like `signUp` or `userMany`. Upon success the operation behave as a field in the response object that will contain the relevant information.

For each operation there are arguments that can be passed in like a filter, username, skip, limit, etc.

When successful each operation returns the corresponding objects with the fields that were selected in the query string.

For example a query string for signing up could look like this:
```
mutation { 
    signUp(username: "Billy", password: "password") {
        user
    }
}
```
Where `mutation` is the operation type, `signUp` is the operation, `username` and `password` are the arguments and `user` is the username of the created and logged in user. The response would look like this:
```
{
    "data": {
        "signUp": {
            "user": "Billy"
        }
    }
}
```

Variables can be used in query strings as well by doing the following:
```
mutation ($username: String!, $password: String!) { 
    signUp(username: $username, password: $username) {
        user
    }
}
```
Then using a variables object in the body like so:
```
{
    "username": "Billy",
    "password": "password"
}
```

Additionally multiple queries can be contained in the query string by providing a name to each operation like so:
```
mutation createUser ($username: String!, $password: String!) { 
    signUp(username: $username, password: $username) {
        user
    }
}

mutation logIn ($username: String!, $password: String!) { 
    signIn(username: $username, password: $username) {
        user
    }
}
```

Then specifying the variables as before and selecting a single operation by using `operationName: "createUser"` in the request body.

## Required Fields
Required fields are specified in GraphQL using `!` following the type of the field.

## Conducting a query
All GraphQL queries utilize the `POST /graphql/` method with `Content-Type: application/json`

A response of `200` indicates success and `500` indicates a failure.
### Success
A successful query will be accompanied by a response object with the following shape:
- data: (Object) this contains the return data
    - field: (Any) field will be replaced with the name of the operation that was conducted like `signUp` or `userMany`, and the type will be the return type defined by the operation

### Errors
A failure will be accompanied by a response with the following shape:

- errors: (list of Objects)
    - message: (String) error message
    - locations: (list of Objects)
        - line: (Int) line number that caused the error
        - column: (Int) column of that line that caused the error
    - path: (list of Strings) indicating the names of operations that lead to the error
- data: Typically `null`

## Important Types

### LoggedInUser
Returned when siging in or up

- user: (String!) username of the user that got logged in

### Completed
- completed: (Boolean!) true if the action was completed

### Session

Represents a session that a user can save solves to

- _id: (MongoID!) string that is used as the ID for the session
- user: (String) username of the user that created the session
- updatedAt: (Date) last time the session was updated
- createdAt: (Date) when the session was created

### User

Represents a user and their versus stats.

- _id: (String!) username
- elo: (Float) current elo rating of the user, used to match against similar skill level players
- wins: (Float) total wins in versus
- losses: (Float) total losses in versus
- updatedAt: (Date) last time the user was updated
- createdAt: (Date) when the user was created

### Solve

Stores information about time, cube size and session for a users solves.

- session: (MongoID!) string id for the session that the solve belongs to
- time: (Float!) solve time milliseconds
- user: (String) user that the solve belongs to
- size: (EnumSolveSize) One of ["_2x2", "_3x3", "_4x4", "_5x5", "_6x6", "_7x7", "_8x8"]
- _id: (MongoID!) string id for the solve
- updatedAt: (Date) last time the solve was updated
- createdAt: (Date) when the solve was created

### QueuedUsers

List of the users that are currently waiting for a match.

- _id: (String!) username of the user in queue
- elo: (Float!) the users elo rating
- updatedAt: (Date) last time their status in the queue was updated
- createdAt: (Date) when they joined the queue


### Match

Represents a match between 2 users

- user1: (String!) username of player 1
- user2: (String!) username of player 2
- user1Time: (Float) solve time in seconds of player 1
- user2Time: (Float) solve time in seconds of player 2
- user1Win: (Float!) elo exchanged if player 1 wins
- user2Win: (Float!) elo exchanged if player 2 wins
- completed: (Boolean!) true if the match has been completed
- scramble: (MatchScramble)
    - state: (String!) string representing the state of the cube after scramble
    - scrambleString: (String!) human readable scramble
- _id: (MongoID!) string id for the match
- updatedAt: (Date) last time the match was updated
- createdAt: (Date) when the match was created

### QuickStats

Quick statistics about each cube the user has solved

- _id: (String) One of ["_2x2", "_3x3", "_4x4", "_5x5", "_6x6", "_7x7", "_8x8"]
- slowest: (Float) slowest time for the size corresponding to _id
- fastest: (Float) fastest time for the size corresponding to _id
- avg: (Float) average time for the size corresponding to _id
- count: (Float) number of solves for the size corresponding to _id

### CreateOneSolvePayload

Payload returned when creating a single solve in a session

- recordId: (MongoID) string id of the created record
- record: (Solve) solve type described above

### Filter
Many queries support a filter argument that allows filtering specific fields that are contained in the return type. For example `filter: { _id: "someid" }` will filter for _id = "someid" and is valid if the return type of a query or mutation has the field _id.
Filters also support `OR` and `AND` which utilize lists of filters like so:
`
filter: { OR: [{ _id: "someid" }, {_id: "someotherid" }] }
`
Queries that support this type of filtering will have the argument listed as filter: (Filter)

### Sort
Similarly to filter many queries support a sort argument that takes in an enum of the format 
FIELD_ASC or FIELD_DESC where FIELD is an all caps version of a field from the return type.
For example sorting users by wins would use `sort: WINS_DESC` or `sort: WINS_ASC` depending on the desired order.
Queries that support this type of filter will have the argument listed as sort: (Sort)

## Authentication

Queries or mutations that require authentication can throw errors with the following messages:
- "Error: You must be logged in for this action"
    - This error occurs when the user is not logged in
- "Error: Access denied"
    - This error occurs when the user attempts to access sensitive information
    of another user

The following is the process of signing up, signing in and signing out.
### Sign Up
- description: sign up a new user
- operation type: `mutation`
    - operation: `signUp`
        - username: (String!) username for the new user (1 to 30 chars)
        - password: (String!) password for the new user (8 characters min)
- return type: [`LoggedInUser!`](#loggedinuser)
- Possible errors:
    - "Error: Password is too short."
    - "Error: Username is not between 1 and 30 characters."
    - "Username already taken."

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "mutation { signUp(username: \"Billy\", password:\"password\") { user } }"}' -c cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```

### Sign In
- description: sign in as an existing user
- operation type: `mutation`
    - operation: `signUp`
        - username: (String!) username for the new user (1 to 30 chars)
        - password: (String!) password for the new user (8 characters min)
- response: [`LoggedInUser!`](#loggedinuser)
    - user: (String!) username of the signed up and logged in user
- Possible errors:
    - "Error: Password is too short."
    - "Error: Username is not between 1 and 30 characters."
    - "Invalid credentials."

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "mutation { signIn(username: \"Billy\", password:\"password\") { user } }"}' -c cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```

### Sign Out
- description: sign in as an existing user
- operation type: `mutation`
    - operation: `signOut`
- response: [`Completed!`](#completed)
    - completed: (Boolean!) true if successfully logged out

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "mutation { signOut { completed } }"}' -c cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```

## Queries
### userById
- description: get user details by their username
- operation type: `query`
    - operation: `userById`
        - _id: (String!) username of the desired user
- return type: [`User`](#user)


### userMany
- description: get list of users
- operation type: `query`
    - operation: `userMany`
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: `[`[`User`](#user)`!]!` list of users

This operation has additional operators available in the filter for the fields elo, wins and losses to be able to easily obtain users above or below certain thresholds.

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "query { userMany (filter: {_operators: {wins: {gt: 2}}}, sort: WINS_DESC) { _id, elo, wins, losses } } "}' https://thecubingcafe.herokuapp.com/graphql/
```
Example response:
```
{
    "data": {
        "userMany":[
            {
                "_id":"jlynx",
                "elo":776,
                "wins":5,
                "losses":3
            },
            {
                "_id":"NoWayJose",
                "elo":739,
                "wins":3,
                "losses":4
            }
        ]
    }
}
```


### userCount
- description: get total number of users
- operation type: `query`
    - operation: `userCount`
- return type: `NumOfUsers!`
    - Max: (Float) number of users

### sessionMany
- description: get list of sessions, `user` in filter will always be set to logged in user, access will be denied if `user` is manually set to someone else
- authenication required: `yes`
- operation type: `query`
    - operation: `sessionMany`
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: `[`[`Session`](#session)`!]!` list of sessions

### getSession
- description: get latest session, if one does not exist for the user it will be created
- authenication required: `yes`
- operation type: `query`
    - operation: `getSession`
- return type: [`Session`](#session)`!` latest session

### solveMany
- description: get list of solves, `user` in filter will always be set to logged in user, access will be denied if `user` is manually set to someone else
- authenication required: `yes`
- operation type: `query`
    - operation: `solveMany`
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: `[`[`Solve`](#solve)`!]!` list of solves

This operation has additional operators available in the filter for the field time to be able to easily obtain solves above or below certain thresholds.

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "query { solveMany (filter: {_operators: {time: {gt: 4000}}}) { user, time, size, createdAt } }"}' -b cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```
Example response:
```
{
  "data": {
    "solveMany": [
      {
        "user": "Billy",
        "time": 4523,
        "size": "_3x3",
        "createdAt": "2021-04-08T04:17:50.112Z"
      },
      {
        "user": "Billy",
        "time": 9299,
        "size": "_3x3",
        "createdAt": "2021-04-10T02:11:37.673Z"
      }
    ]
  }
}
```

### matchMany
- description: get list of matches
- authenication required: `yes`
- operation type: `query`
    - operation: `matchMany`
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: `[`[`Match`](#match)`!]!` list of matches
```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "query { matchMany (filter: {user1: \"Billy\"}) { user1Time, user2, user2Time } }"}' -b cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```
Example Response:
```
{
  "data": {
    "matchMany": [
      {
        "user1Time": 3.756,
        "user2": "NoWayJose",
        "user2Time": 2.694
      },
      {
        "user1Time": 3.131,
        "user2": "NoWayJose",
        "user2Time": 3.058
      }
    ]
  }
}
```

### queueMany
- description: get list of people in queue
- authenication required: `yes`
- operation type: `query`
    - operation: `queueMany`
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: `[`[`QueuedUsers`](#queuedusers)`!]!` list of QueuedUsers

### userWinsOrLosses
- description: get a list of the losses or wins
- authenication required: `yes`
- operation type: `query`
    - operation: `userWinsOrLosses`
        - username: (String) username of the user
        - losses: (Boolean) true if you want to find losses, defaults to false
- return type: `[`[`Match`](#match)`!]`

### getStats
- description: get a quick stats for logged in users solves
- authenication required: `yes`
- operation type: `query`
    - operation: `getStats`
- return type: `[`[`QuickStats`](#quickstats)`!]`

### solveCount
- description: get a quick stats for logged in users solves
- authenication required: `yes`
- operation type: `query`
    - operation: `solveCount`
        - filter: (Filter)
- return type: `Int`
```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "query { solveCount { _id, user, createdAt } }"}' -b cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```
Example response:
```
{
  "data": {
    "solveCount": 37
  }
}
```
## Mutations

### createSession
- description: create a new solve session for the logged in user
- authenication required: `yes`
- operation type: `mutation`
    - operation: `createSession`
- return type: [`Session`](#session)`!`

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "mutation { createSession { _id, user, createdAt } }"}' -b cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```
Example response:
```
{
  "data": {
    "createSession": {
      "_id": "60720267b80a0a0015227890",
      "user": "Billy",
      "createdAt": "2021-04-10T19:54:15.619Z"
    }
  }
}
```

### insertSolve
- description: create a new solve associated with the given session for the logged in user
- authentication required: `yes`
- operation type: `mutation`
    - operation: `insertSolve`
        - record: (Solve!) user in provided record will be overwritten by logged in user
- return type: [`CreateOneSolvePayload`](#createonesolvepayload)

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "mutation { insertSolve(record: {session: "60720267b80a0a0015227890", time: 21000}) { recordId, record { time, user, session } } }"}' -b cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```
Example response:
```
{
  "data": {
    "insertSolve": {
      "recordId": "60720569b80a0a0015227893",
      "record": {
        "time": 21000,
        "user": "Billy",
        "session": "60720267b80a0a0015227890"
      }
    }
  }
}
```