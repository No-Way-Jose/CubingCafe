# CubingCafe GraphQL documentation

A sandbox for playing around with GraphQL can be found here [link](https://thecubingcafe.herokuapp.com/graphql/). At the top right corner you will also find some interactive docs.

GraphQL is built on top of POST requests using the body in the following manner:
- query: string of the GraphQL query
- variables: value for any variables that may be included in the query string
- operationName: string of the target operation in the query

Our GraphQL API has two operation types ```query``` (like ```GET```) and ```mutation``` (like ```POST``` or ```PATCH```)

Each operation type has various underlying operations like ```signUp``` or ```userMany```.

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
Where ```mutation``` is the operation type, ```signUp``` is the operation, ```username``` and ```password``` are the arguments and ```user``` is the username of the created and logged in user.

Variables can be used in query strings as well by doing the following:
```
mutation ($username: String!, $password: String!) { 
    signUp(username: $username, password: $username) {
        user
    }
}
```
Then passing the variables object like so:
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
Note: when specifying types ```!``` at the end of the type indicates a required field.

Then specifying the variables as before and selecting a single operation by using ```operationName: "createUser"```

All GraphQL queries utilize the ```POST /graphql/``` method with ```Content-Type: application/json```

A response of ```200``` indicates success and ```500``` indicates a failure. A failure will be accompanied by a response with the following shape:

- errors: (list of Objects)
    - message: (String) error message
    - locations: (list of Objects)
        - line: (Int) line number that caused the error
        - column: (Int) column of that line that caused the error
    - path: (list of Strings) indicating the names of operations that lead to the error
- data: Typically ```null```

## Return Types

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
- user1Time: (Float) solve time of player 1
- user2Time: (Float) solve time of player 2
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

## Authentication

### Sign Up
- description: sign up a new user
- operation type: ```mutation```
    - operation: ```signUp```
        - username: (String!) username for the new user (1 to 30 chars)
        - password: (String!) password for the new user (8 characters min)
- return type: ```LoggedInUser!```
- Possible errors:
    - "Error: Password is too short."
    - "Error: Username is not between 1 and 30 characters."
    - "Username already taken."

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "mutation { signUp(username: \"Billy\", password:\"password\") { user } }"}' -c cookie.txt https://thecubingcafe.herokuapp.com/graphql/
```

### Sign In
- description: sign in as an existing user
- operation type: ```mutation```
    - operation: ```signUp```
        - username: (String!) username for the new user (1 to 30 chars)
        - password: (String!) password for the new user (8 characters min)
- response: ```LoggedInUser!```
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
- operation type: ```mutation```
    - operation: ```signOut```
- response: ```Completed!```
    - completed: (Boolean!) true if successfully logged out

```
$  curl -H "Content-Type: application/json" -X POST -d '{"query": "mutation { signOut { completed } }"}' -c cookie.txt https://thecubingcafe.herokuapp.com/graphql/graphql/
```

### Filter
Many queries support a filter argument that allows filtering specific fields that are contained in the return type. For example ```filter: { _id: "someid" }``` will filter for _id = "someid" and is valid if the return type has the field _id.
Filters also support ```OR``` and ```AND``` which utilize lists of filters like so:
```
filter: { OR: [{ _id: "someid" }, {_id: "someotherid" }] }
```
Queries that support this type of filtering will have the argument listed as filter: (Filter)

### Sort
Similarly to filter many queries support a sort argument that takes in an enum of the format 
FIELD_ASC or FIELD_DESC where FIELD is an all caps version of a field from the return type.
For example sorting users by wins would use ```sort: WINS_DESC``` or ```sort: WINS_ASC``` depending on the desired order.
Queries that support this type of filter will have the argument listed as sort: (Sort)

## Queries
### userById
- description: get user details by their username
- operation type: ```query```
    - operation: ```userById```
        - _id: (String!) username of the desired user
- return type: ```User```


### userMany
- description: get list of users
- operation type: ```query```
    - operation: ```userMany```
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: ```[User!]!``` list of users

### userCount
- description: get total number of users
- operation type: ```query```
    - operation: ```userCount```
- return type: ```NumOfUsers!```
    - Max: (Float) number of users

### sessionMany
- description: get list of sessions, authentication required, ```user``` in filter will always be set to logged in user
- operation type: ```query```
    - operation: ```sessionMany```
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: ```[Session!]!``` list of sessions

### getSession
- description: get latest session, if one does not exist for the user it will be created, authentication required
- operation type: ```query```
    - operation: ```getSession```
- return type: ```Session!``` latest session

### solveMany
- description: get list of solves, authentication required, ```user``` in filter will always be set to logged in user
- operation type: ```query```
    - operation: ```solveMany```
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: ```[Solve!]!``` list of solves

### matchMany
- description: get list of matches, authentication required
- operation type: ```query```
    - operation: ```matchMany```
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: ```[Match!]!``` list of matches

### queueMany
- description: get list of people in queue, authentication required
- operation type: ```query```
    - operation: ```queueMany```
        - filter: (Filter)
        - limit: (Int) number of records to return (default 100)
        - skip: (Int) number of records to skip
        - sort: (Sort)
- return type: ```[QueuedUsers!]!``` list of QueuedUsers

### userWinsOrLosses
- description: get a list of the losses or wins, authentication required
- operation type: ```query```
    - operation: ```userWinsOrLosses```
        - username: (String) username of the user
        - losses: (Boolean) true if you want to find losses, defaults to false
- return type: ```[Match!]```

### getStats
- description: get a quick stats for logged in users solves, authentication required
- operation type: ```query```
    - operation: ```getStats```
- return type: ```[QuickStats!]```

### solveCount
- description: get a quick stats for logged in users solves, authentication required
- operation type: ```query```
    - operation: ```solveCount```
        - filter: (Filter)
- return type: ```Int```

## Mutations

### createSession
- description: create a new session for the logged in user, authentication required
- operation type: ```mutation```
    - operation: ```createSession```
- return type: ```Session!```

### insertSolve
- description: create a new solve for the logged in user, authentication required
- operation type: ```mutation```
    - operation: ```insertSolve```
        - record: (Solve!) user in provided record will be overwritten by logged in user
- return type: ```CreateOneSolvePayload```