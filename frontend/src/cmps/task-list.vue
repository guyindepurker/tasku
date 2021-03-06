<template>
  <section v-if="clonedTasks" class="task-list-container width100">
    <ul class="task-list clean-list flex wrap align-center justify-center gap">
      <draggable
        class="width100"
        :list="clonedTasks"
        group="tasks"
        @change="updateTasks"
      >
        <task-preview
          v-for="task in clonedTasks"
          :user="user"
          :taskColor="taskColor"
          :key="task.id"
          :task="task"
          :statuses="board.statuses"
          :priorities="board.priorities"
          :groupId="groupId"
          @deleteTask="deleteTask"
          @updateTask="updateTask"
          :boardMembers="board.members"
        />
      </draggable>
    </ul>
    <form class="add-task-form flex" @submit.prevent="addTask">
      <span class="task-color input-color" :style="taskBgc"></span>
      <input
        class="add-task-input"
        @focus="showAddBtn"
        v-model="txt"
        type="text"
        placeholder="+ Add Task"
      />
      <button v-show="isAddBtnShowen" type="submit">Add</button>
    </form>
  </section>
</template>
<script>
import taskPreview from './task-preview'
import { boardService } from '@/services/board.service'
import draggable from 'vuedraggable'
// import { eventBus } from '@/services/event-bus.service'
export default {
  name: 'task-list',
  props: {
    tasks: Array,
    groupId: String,
    taskColor: String
  },
  data() {
    return {
      txt: '',
      isAddBtnShowen: false,
      clonedTasks: null
    }
  },
  computed: {
    board() {
      return this.$store.getters.board
    },
    data() {
      return {
        txt: '',
        isAddBtnShowen: false,
        clonedTasks: null
      }
    },
    taskBgc() {
      return { backgroundColor: this.taskColor }
    },
    user() {
      return this.$store.getters.user
    },
    miniUser() {
      return this.$store.getters.miniUser
    }
  },
  methods: {
    addEmptyTask(groupId) {
      if (this.groupId !== groupId) {
        return
      }
      const newTask = boardService.getEmptyTask()
      const group = this.getGroupById()
      const txt = `${this.user.fullName} add new task in ${group.name}`
      let newActivity = boardService.getEmptyActivity(txt, this.miniUser)
      newActivity.groupId = groupId
      this.board.activities.unshift(newActivity)
      group.tasks.push(newTask)
      this.$store.dispatch({
        type: 'saveBoard',
        board: this.board
      })
      this.$notify({
        message: 'New task added',
        position: 'bottom-left',
        duration: 2000
      })
      this.$emit('forceRender')
    },
    showAddBtn() {
      this.isAddBtnShowen = true
    },
    getGroupById() {
      const idx = this.board.groups.findIndex(
        group => group.id === this.groupId
      )
      return this.board.groups[idx]
    },
    addTask() {
      const newTask = boardService.getEmptyTask()
      newTask.txt = this.txt
      const txt = `Task '${newTask.txt}' added`
      let newActivity = boardService.getEmptyActivity(txt, this.miniUser)
      newActivity.groupId = this.groupId
      this.board.activities.unshift(newActivity)
      const group = this.getGroupById()
      group.tasks.push(newTask)
      this.$store.dispatch({
        type: 'saveBoard',
        board: this.board
      })
      this.txt = ''
      this.isAddBtnShowen = false
      this.$notify({
        message: 'New task added',
        position: 'bottom-left',
        duration: 2000
      })
      this.$emit('forceRender')
    },
    deleteTask(taskId) {
      const group = this.getGroupById()
      const taskIdx = group.tasks.findIndex(task => task.id === taskId)
      group.tasks.splice(taskIdx, 1)
      const txt = `${this.user.fullName} remove a task from ${group.name}`
      let newActivity = boardService.getEmptyActivity(txt, this.miniUser)
      newActivity.groupId = this.groupId
      this.board.activities.unshift(newActivity)
      this.$store.dispatch({
        type: 'saveBoard',
        board: this.board
      })
      this.$notify({
        message: 'Task removed',
        position: 'bottom-left',
        duration: 2000
      })
      this.$emit('forceRender')
    },
    updateTask(newTask, activity) {
      if (activity) {
        this.board.activities.unshift(activity)
      }
      const group = this.getGroupById()
      const taskIdx = group.tasks.findIndex(task => task.id === newTask.id)
      group.tasks.splice(taskIdx, 1, newTask)
      this.$store.dispatch({
        type: 'saveBoard',
        board: this.board
      })
      this.$emit('forceRender')
    },
    async updateTasks() {
      const group = this.getGroupById()
      group.tasks = this.clonedTasks
      this.$store.dispatch({
        type: 'saveBoard',
        board: this.board
      })
      this.$emit('forceRender')
    }
  },
  created() {
    this.clonedTasks = JSON.parse(JSON.stringify(this.tasks))
  },
  components: {
    taskPreview,
    draggable
  }
}
</script>
