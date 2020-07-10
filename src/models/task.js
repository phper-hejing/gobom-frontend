import request from '../utils/request';
import { REQUEST_URL } from '../constant';

const taskDataUrl = REQUEST_URL + '/task';
const taskAddUrl = REQUEST_URL + '/task/add';
const taskEditUrl = REQUEST_URL + '/task/edit';
const taskDelUrl = REQUEST_URL + '/task/delete';
const taskRunUrl = REQUEST_URL + '/task/run';
const taskStopUrl = REQUEST_URL + '/task/stop';

const taskDefault = data => {
  if (!data || !data.task) {
    return {
      key: 0,
      taskId: '',
      name: '--',
      conCurrent: '--',
      duration: '--',
      status: '--',
      successNum: '--',
      failureNum: '--',
      maxTime: '--',
      minTime: '--',
      createdAt: '--',
    };
  }
  return {
    key: data.task.taskId,
    taskId: data.task.taskId,
    name: data.name,
    conCurrent: data.task.worker.options.conCurrent,
    duration: data.task.worker.options.duration,
    status: data.task.status,
    successNum: data.task.worker.report.successNum,
    failureNum: data.task.worker.report.failureNum,
    maxTime: data.task.worker.report.maxTime,
    minTime: data.task.worker.report.minTime,
    createdAt: data.CreatedAt,
  };
};

export default {
  namespace: 'task',
  state: {
    taskList: [],
  },
  effects: {
    *getTaskList(_, { call, put }) {
      const resp = yield call(request, taskDataUrl);
      if (resp.msg == '') {
        yield put({ type: 'setTaskList', payload: resp.data });
      }
      return resp;
    },
    *addTask({ payload: data }, { call, put }) {
      return yield call(request, taskAddUrl, {
        body: JSON.stringify(data),
      });
    },
    *editTask({ payload: data }, { call, put }) {
      return yield call(request, taskEditUrl, {
        body: JSON.stringify(data),
      });
    },
    *delTask({ payload: id }, { call, put }) {
      return yield call(request, taskDelUrl, {
        body: JSON.stringify({
          taskId: id,
        }),
      });
    },
    *runTask({ payload: id }, { call, put }) {
      return yield call(request, taskRunUrl, {
        body: JSON.stringify({
          taskId: id,
        }),
      });
    },
    *stopTask({ payload: id }, { call, put }) {
      return yield call(request, taskStopUrl, {
        body: JSON.stringify({
          taskId: id,
        }),
      });
    },
  },
  reducers: {
    setTaskList(state, { payload: dataList }) {
      let taskList = JSON.parse(JSON.stringify(state.taskList));
      for (let data of dataList) {
        taskList[data.task.taskId] = taskDefault(data);
      }
      return {
        ...state,
        taskList: taskList,
      };
    },
    setTask(state, { payload: index }) {
      if (!state.taskList[index]) {
        console.log('查找task失败，data :', state.taskList);
        console.log('index: ', index);
      }
      return {
        ...state,
        task: state.taskList[index],
      };
    },
    moveTask(state, { payload: key }) {
      return {
        ...state,
        taskList: state.taskList.filter((val, index) => {
          if (index != key) {
            return val;
          }
        }),
      };
    },
    saveTask(state, { payload: data }) {},
  },
};
