import { userService } from '@/services/user.service.js'

var localLoggedinUser = null
if (sessionStorage.user) localLoggedinUser = JSON.parse(sessionStorage.user)

export const userStore = {
  state: {
    users: [],
    loggedInUser: localLoggedinUser
  },
  getters: {
    users(state) {
      return JSON.parse(JSON.stringify(state.users))
    },
    user(state) {
      return JSON.parse(JSON.stringify(state.loggedInUser))
    },
    miniUsers(state) {
      let copiedUsers = JSON.parse(JSON.stringify(state.users)).map(user => {
        return {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          imgUrl: user.imgUrl
        }
      })
      return copiedUsers
    },
    miniUser(state) {
      let user = JSON.parse(JSON.stringify(state.loggedInUser))
      user = {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        imgUrl: user.imgUrl
      }
      return user
    },
    guestUser() {
      return {
        _id: '5fcf43042225f532488c5ac0',
        email: 'guestUser@tasku.com',
        password: 'guestpassword',
        fullName: 'Guest',
        isAdmin: false,
        notifications: []
      }
    }
  },
  mutations: {
    insertUserNotif(state, { notif }) {
      state.loggedInUser.notifications.unshift(notif)
    },
    setUsers(state, { users }) {
      state.users = users
    },

    setUser(state, { user }) {
      state.loggedInUser = user
    },
    updateUser(state, { user }) {
      const idx = state.users.findIndex(currUser => currUser._id === user._id)
      state.users.splice(idx, 1, user)
      if (state.loggedInUser._id === user._id) state.loggedInUser = user
    },
    deleteUser(state, { userId }) {
      const idx = state.users.findIndex(user => user._id === userId)
      state.users.splice(idx, 1)
    },
    addUser(state, { user }) {
      state.users.unshift(user)
    }
  },
  actions: {
    async loadUsers({ commit }) {
      try {
        const users = await userService.getUsers()
        commit({ type: 'setUsers', users })
      } catch (err) {
        console.log('ERROR:cant find users')
        throw err
      }
    },
    async loadUser({ commit }, { userId }) {
      try {
        const user = await userService.getById(userId)
        commit({ type: 'setUser', user })
      } catch (err) {
        console.log('ERROR:cant find user')
        throw err
      }
    },
    async removeUser({ commit }, { userId }) {
      try {
        await userService.remove(userId)
        commit({ type: 'removeUser', userId })
      } catch (err) {
        console.log('ERROR: cant remove user')
        throw err
      }
    },
    async updateUser({ commit }, { user }) {
      try {
        const savedUser = await userService.save(user)
        commit({ type: 'updateUser', user: savedUser })
        return savedUser
      } catch (err) {
        console.log('ERROR:cant updated user!')
        throw err
      }
    },
    async addUser({ commit }, { user }) {
      try {
        const savedUser = await userService.save(user)
        commit({ type: 'addUser', user: savedUser })
        return savedUser
      } catch (err) {
        console.log('ERROR:cant add user')
        throw err
      }
    },
    async login(context, { userCred }) {
      try {
        if (userCred === 'guest') {
          const guestCred = {
            email: 'guestUser@tasku.com',
            password: 'guestpassword',
            isAdmin: false
          }
          const user = await userService.login(guestCred)
          context.commit({ type: 'setUser', user })
          return user
        } else {
          const user = await userService.login(userCred)
          context.commit({ type: 'setUser', user })
          return user
        }
      } catch (err) {
        console.log('USER STORE ERROR TYPE:', err.response.status)
        throw err
      }
    },
    async logout(context) {
      context.dispatch({ type: 'deletePrivateSocket' })
      try {
        await userService.logout()
        context.commit({ type: 'setUsers', users: [] })
        context.commit({ type: 'setUser', user: null })
      } catch (err) {
        console.log('ERROR:cant logout')
        throw err
      }
    },
    async signup(context, { userCred }) {
      try {
        const user = await userService.signup(userCred)
        context.commit({ type: 'setUser', user })
        return user
      } catch (err) {
        console.log('CANT SIGN UP ')
        throw err
      }
    },

    async sendNotif(context, { notif }) {
      await userService.sendNotif(notif)

    }
  }
}
