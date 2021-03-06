function composeUsers(users) {
    if (users instanceof Array) {
        return users.map(composeUser)
    }
    return composeUser(users)
}
function composeUser(user) {
    return {
        avatarUrl: user.avatarUrl,
        id: user.id,
        email: user.email,
        subscription: user.subscription,
        status: user.status
    }
}

module.exports = composeUsers