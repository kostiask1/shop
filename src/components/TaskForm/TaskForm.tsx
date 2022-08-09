import { FC, useCallback, useEffect, useMemo, useState } from "react"
import InputMask from "react-input-mask"
import { dateFormat, equal } from "../../helpers"
import { setError, setSuccess } from "../../store/appSlice"
import { RootState, useAppDispatch, useAppSelector } from "../../store/store"
import {
  deleteTask,
  editingTask,
  setTask,
  taskInitialState,
} from "../../store/taskSlice"
import { Subtask as ISubtask, Task, User } from "../../store/types"
import Subtask from "../Subtask/Subtask"
import Button from "../UI/Button"
import Input from "../UI/Input"
import Textarea from "../UI/Textarea"
import "./TaskForm.scss"

interface TaskInterface {
  setModal?: undefined | Function
}

const TaskForm: FC<TaskInterface> = ({ setModal }) => {
  const dispatch = useAppDispatch()
  const user: User = useAppSelector((state: RootState) => state.auth.user)

  const task: Task | null = useAppSelector(
    (state: RootState) => state.tasks.editingTask
  )
  const [state, setState] = useState<Task>(task || taskInitialState)
  const [loadingComplete, setLoadingComplete] = useState(false)
  const [loadingSave, setLoadingSave] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [subtask, setSubtask] = useState<string>("")

  const isEdit = state.id !== 0
  const stateName = isEdit ? "Edit" : "Create"

  useEffect(() => {
    if (state.subtasks?.length) {
      const subtasksCompleted = state.subtasks.every(
        (subtask) => subtask.completed
      )
      if (state.id) {
        if (!state.completed && subtasksCompleted) {
          complete(null, true)
        }
        if (state.completed && !subtasksCompleted) {
          complete(null, false)
        }
      } else {
        if (!state.completed && subtasksCompleted) {
          state.completed = true
        }
        if (state.completed && !subtasksCompleted) {
          state.completed = false
        }
      }
    }
  }, [state])

  const addTaskToUser = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const saveTask: Task = { ...state }
      setLoadingSave(true)
      if (!isEdit) {
        saveTask.id = new Date().getTime()
        saveTask.start = new Date().getTime()
      }
      if (saveTask.end === "dd-mm-yyyy") {
        saveTask.end = ""
      }
      saveTask.uid = user.id
      await dispatch(setTask(saveTask))
      setModal && !isEdit && setModal(null)
      setLoadingSave(false)
      isEdit
        ? dispatch(setSuccess("Task updated successfully"))
        : dispatch(setSuccess("Task created successfully"))
      clear()
    },
    [state]
  )

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const name = event.target.name
    const value = event.target.value
    setState((state: Task) => ({ ...state, [name]: value }))
  }

  const clear = useCallback((e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault()
    setState(taskInitialState)
    dispatch(editingTask(null))
  }, [])

  const reset = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setState(task || taskInitialState)
  }, [])

  const deleteT = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      setDeleting(true)
      await dispatch(deleteTask(state))
      dispatch(editingTask(taskInitialState))
      setDeleting(false)
      dispatch(setSuccess("Task deleted successfully"))
    },
    [state]
  )

  const complete = useCallback(
    async (e: React.FormEvent | null, completed: boolean) => {
      e && e.preventDefault()
      if (state) {
        setLoadingComplete(true)
        const saveTask: Task = { ...state }
        saveTask.completed = completed
        await dispatch(setTask(saveTask))
        dispatch(editingTask(saveTask))
        setLoadingComplete(false)
        setState(saveTask)
        setModal && setModal(saveTask)
        if (completed) {
          dispatch(setSuccess("Task completed"))
        } else {
          dispatch(setError("Task returned"))
        }
      }
    },
    [state]
  )

  const formatChars: Array<RegExp | string> = useMemo(
    () => dateFormat(state.end as string),
    [state.end]
  )

  const addSubtask = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault()
      if (subtask.trim().length) {
        const newTask: ISubtask = { text: subtask, completed: false }
        setSubtask("")
        setState((state: Task) => ({
          ...state,
          subtasks: [...state.subtasks, newTask],
        }))
      }
    },
    [subtask]
  )
  const handleSubtask = (e: React.ChangeEvent<HTMLInputElement>) =>
    e.target.value.trim().length < 160 && setSubtask(e.target.value)

  return (
    <>
      <form
        className="card task fadeIn"
        key={state.id}
        onSubmit={addTaskToUser}
      >
        <header className="card-header">
          <div className="card-header-title is-align-items-center">
            {stateName} Task -
            <Input
              type="text"
              name="title"
              className="ml-2 input"
              value={state.title}
              onChange={handleChange}
              placeholder="Task Title"
              maxLength={40}
              required
            />
            {!!state.start && (
              <Button
                className={`complete-task-btn ${
                  state.completed ? "is-primary" : "is-danger"
                }`}
                onClick={(e) => complete(e, !state.completed)}
                text={`${
                  loadingComplete
                    ? "Updating..."
                    : `Completed: ${state.completed ? "Yes" : "No"}`
                }`}
                disabled={loadingComplete || loadingSave || deleting}
              />
            )}
          </div>
        </header>
        <div className="card-content">
          <div className="content">
            <label htmlFor="description">Description</label>
            <Textarea
              value={state.description}
              onChange={handleChange}
              placeholder="Task Descpription"
              name="description"
              required
            />
            <label htmlFor="subtask">
              <b>Subtasks</b>
            </label>
            <hr style={{ margin: "5px 0" }} />
            <ul key={JSON.stringify(state.subtasks)}>
              {state.subtasks?.map((subtask, index) => (
                <Subtask
                  key={subtask.text + index}
                  data={subtask as ISubtask}
                  task={state}
                  state={"create"}
                  edit={setSubtask}
                  update={(data) =>
                    setState((state: Task) => ({ ...state, subtasks: data }))
                  }
                />
              ))}
            </ul>
            <Input
              name="subtask"
              placeholder="Enter subtask"
              value={subtask}
              onChange={handleSubtask}
            />
            <Button
              onClick={addSubtask}
              className="add-subtask is-info"
              text="Add subtask"
              disabled={loadingSave || deleting || !subtask.trim().length}
            />
            <br />
            <hr style={{ margin: "10px 0" }} />
            <label htmlFor="end">Deadline</label>
            <InputMask
              className="input"
              mask={formatChars}
              maskPlaceholder="dd-mm-yyyy"
              alwaysShowMask={true}
              name="end"
              id="end"
              value={state.end}
              onChange={handleChange}
            />
          </div>
        </div>
        <footer className="card-footer p-3">
          <div className="buttons">
            {isEdit ? (
              <Button
                className="mx-2 card-footer-item is-success"
                text={loadingSave ? "Updating..." : "Update"}
                disabled={
                  loadingComplete ||
                  loadingSave ||
                  deleting ||
                  equal(state, task)
                }
              />
            ) : (
              <Button
                className="mx-2 card-footer-item is-success"
                text={loadingSave ? "Saving..." : "Save"}
                disabled={
                  loadingComplete ||
                  loadingSave ||
                  deleting ||
                  equal(state, taskInitialState)
                }
              />
            )}
            {isEdit && (
              <Button
                className="mx-2 card-footer-item is-danger"
                text={deleting ? "Deleting..." : "Delete"}
                onClick={deleteT}
                disabled={loadingComplete || loadingSave || deleting}
              />
            )}
            {isEdit && !setModal ? (
              <Button
                onClick={clear}
                className="mx-2 card-footer-item is-warning"
                text="Clear"
                disabled={loadingComplete || loadingSave || deleting}
              />
            ) : (
              <Button
                onClick={reset}
                className="mx-2 card-footer-item is-warning"
                text="Reset"
                disabled={
                  loadingComplete ||
                  loadingSave ||
                  deleting ||
                  equal(state, task || taskInitialState)
                }
              />
            )}
          </div>
        </footer>
      </form>
    </>
  )
}

export default TaskForm
