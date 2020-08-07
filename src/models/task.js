import request from '../utils/request';
import { REQUEST_URL } from '../constant';

const taskDataUrl = REQUEST_URL + '/task';
const taskAddUrl = REQUEST_URL + '/task/add';
const taskEditUrl = REQUEST_URL + '/task/edit';
const taskDelUrl = REQUEST_URL + '/task/delete';
const taskRunUrl = REQUEST_URL + '/task/run';
const taskStopUrl = REQUEST_URL + '/task/stop';

const dataDispose = data => {
  let responseData = [];
  let responseErrData = [];
  if (data.task && data.task.worker && data.task.worker.report) {
    let report = data.task.worker.report;

    // 统计时间段内请求得成功和失败数
    let successKeys = [];
    let errorKeys = [];
    let successMap = [];
    let errorsMap = [];
    if (report.successNumMap) {
      successKeys = Object.keys(report.successNumMap).sort((a, b) => {
        return Date.parse(a) > Date.parse(b);
      });
    }

    if (report.failureNumMap) {
      errorKeys = Object.keys(report.failureNumMap).sort((a, b) => {
        return Date.parse(a) > Date.parse(b);
      });
    }

    if (successKeys.length > errorKeys.length) {
      for (let i in successKeys) {
        let successNum = report.successNumMap[successKeys[i]]
          ? report.successNumMap[successKeys[i]]
          : 0;
        let errorsNum = report.failureNumMap[successKeys[i]]
          ? report.failureNumMap[successKeys[i]]
          : 0;
        responseData.push([
          {
            name: '成功数',
            date: successKeys[i],
            value: successNum,
          },
          {
            name: '失败数',
            date: successKeys[i],
            value: errorsNum,
          },
        ]);
      }
    } else {
      for (let i in errorKeys) {
        let successNum = report.successNumMap[errorKeys[i]]
          ? report.successNumMap[errorKeys[i]]
          : 0;
        let errorsNum = report.failureNumMap[errorKeys[i]]
          ? report.failureNumMap[errorKeys[i]]
          : 0;
        responseData.push([
          {
            name: '成功数',
            date: errorKeys[i],
            value: successNum,
          },
          {
            name: '失败数',
            date: errorKeys[i],
            value: errorsNum,
          },
        ]);
      }
    }

    // 统计失败请求原因
    if (report.errCode) {
      Object.keys(report.errCode).map(errCode => {
        responseErrData.push({
          name:
            report.errCodeMsg && report.errCodeMsg[errCode]
              ? report.errCodeMsg[errCode]
              : errCode,
          value: report.errCode[errCode],
        });
      });
    }
  }

  data.responseData = responseData;
  data.responseErrData = responseErrData;
};

const taskDefault = (data, index) => {
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
      scriptId: '--',
    };
  }

  dataDispose(data);

  return {
    key: index,
    taskId: data.task.taskId,
    name: data.name,
    conCurrent: data.task.worker.conCurrent,
    duration: data.task.worker.duration,
    status: data.task.status,
    successNum: data.task.worker.report.successNum,
    failureNum: data.task.worker.report.failureNum,
    maxTime: data.task.worker.report.maxTime,
    minTime: data.task.worker.report.minTime,
    createdAt: data.CreatedAt,
    scriptId: data.scriptId,
    responseData: data.responseData,
    responseErrData: data.responseErrData,
  };
};

const taskSave = (oldData, newData) => {
  if (!newData) {
    return oldData;
  }

  dataDispose(newData);

  return {
    key: oldData.key,
    taskId: oldData.taskId,
    name: oldData.name,
    conCurrent: newData.task.worker.conCurrent,
    duration: newData.task.worker.duration,
    status: newData.task.status,
    successNum: newData.task.worker.report.successNum,
    failureNum: newData.task.worker.report.failureNum,
    maxTime: newData.task.worker.report.maxTime,
    minTime: newData.task.worker.report.minTime,
    createdAt: oldData.createdAt,
    scriptId: oldData.scriptId,
    responseData: newData.responseData,
    responseErrData: newData.responseErrData,
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
      let taskList = [];
      for (let index in dataList) {
        taskList.push(taskDefault(dataList[index], index));
      }
      return {
        ...state,
        taskList: taskList,
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
    saveTask(state, { payload: data }) {
      if (!data) {
        return {
          ...state,
        };
      }

      let taskList = JSON.parse(JSON.stringify(state.taskList));
      for (let index in taskList) {
        if (taskList[index].taskId == data.task.taskId) {
          taskList[index] = taskSave(taskList[index], data);
        }
      }
      return {
        ...state,
        taskList: taskList,
      };
    },
  },
};
