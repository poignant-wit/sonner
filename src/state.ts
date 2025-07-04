import type {
  ExternalToast,
  PromiseData,
  PromiseIExtendedResult,
  PromiseT,
  ToastT,
  ToastToDismiss,
  ToastTypes,
} from './types';

import React from 'react';

let toastsCounter = 1;

type titleT = (() => React.ReactNode) | React.ReactNode;

class Observer {
  subscribers: Map<string, Array<(toast: ExternalToast | ToastToDismiss) => void>>;
  toasts: Array<ToastT | ToastToDismiss>;
  dismissedToasts: Set<string | number>;

  constructor() {
    this.subscribers = new Map();
    this.toasts = [];
    this.dismissedToasts = new Set();
  }

  // We use arrow functions to maintain the correct `this` reference
  subscribe = (subscriber: (toast: ToastT | ToastToDismiss) => void, key?: string) => {
    const toasterKey = key || 'default';
    if (!this.subscribers.has(toasterKey)) {
      this.subscribers.set(toasterKey, []);
    }
    this.subscribers.get(toasterKey)!.push(subscriber);

    return () => {
      const keySubscribers = this.subscribers.get(toasterKey);
      if (keySubscribers) {
        const index = keySubscribers.indexOf(subscriber);
        if (index > -1) {
          keySubscribers.splice(index, 1);
        }
        if (keySubscribers.length === 0) {
          this.subscribers.delete(toasterKey);
        }
      }
    };
  };

  publish = (data: ToastT) => {
    const toasterKey = data.key || 'default';
    const keySubscribers = this.subscribers.get(toasterKey);
    if (keySubscribers) {
      keySubscribers.forEach((subscriber) => subscriber(data));
    }
  };

  addToast = (data: ToastT) => {
    this.publish(data);
    this.toasts = [...this.toasts, data];
  };

  create = (
    data: ExternalToast & {
      message?: titleT;
      type?: ToastTypes;
      promise?: PromiseT;
      jsx?: React.ReactElement;
    },
  ) => {
    const { message, ...rest } = data;
    const id = typeof data?.id === 'number' || data.id?.length > 0 ? data.id : toastsCounter++;
    const alreadyExists = this.toasts.find((toast) => {
      return toast.id === id;
    });
    const dismissible = data.dismissible === undefined ? true : data.dismissible;

    if (this.dismissedToasts.has(id)) {
      this.dismissedToasts.delete(id);
    }

    if (alreadyExists) {
      this.toasts = this.toasts.map((toast) => {
        if (toast.id === id) {
          const updatedToast = { ...toast, ...data, id, title: message };
          this.publish(updatedToast);
          return {
            ...toast,
            ...data,
            id,
            dismissible,
            title: message,
          };
        }

        return toast;
      });
    } else {
      this.addToast({ title: message, ...rest, dismissible, id });
    }

    return id;
  };

  dismiss = (id?: number | string, key?: string) => {
    if (id) {
      this.dismissedToasts.add(id);
      const toasterKey = key || 'default';
      const keySubscribers = this.subscribers.get(toasterKey);
      if (keySubscribers) {
        requestAnimationFrame(() => keySubscribers.forEach((subscriber) => subscriber({ id, dismiss: true })));
      }
    } else {
      // Dismiss all toasts for specific key or all keys if no key provided
      if (key) {
        const keySubscribers = this.subscribers.get(key);
        if (keySubscribers) {
          this.toasts.filter(toast => ('key' in toast && toast.key === key) || (!('key' in toast) && key === 'default')).forEach((toast) => {
            keySubscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
          });
        }
      } else {
        this.toasts.forEach((toast) => {
          const toastKey = ('key' in toast && toast.key) || 'default';
          const keySubscribers = this.subscribers.get(toastKey);
          if (keySubscribers) {
            keySubscribers.forEach((subscriber) => subscriber({ id: toast.id, dismiss: true }));
          }
        });
      }
    }

    return id;
  };

  message = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message });
  };

  error = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, message, type: 'error' });
  };

  success = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'success', message });
  };

  info = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'info', message });
  };

  warning = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'warning', message });
  };

  loading = (message: titleT | React.ReactNode, data?: ExternalToast) => {
    return this.create({ ...data, type: 'loading', message });
  };

  promise = <ToastData>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => {
    if (!data) {
      // Nothing to show
      return;
    }

    let id: string | number | undefined = undefined;
    if (data.loading !== undefined) {
      id = this.create({
        ...data,
        promise,
        type: 'loading',
        message: data.loading,
        description: typeof data.description !== 'function' ? data.description : undefined,
      });
    }

    const p = Promise.resolve(promise instanceof Function ? promise() : promise);

    let shouldDismiss = id !== undefined;
    let result: ['resolve', ToastData] | ['reject', unknown];

    const originalPromise = p
      .then(async (response) => {
        result = ['resolve', response];
        const isReactElementResponse = React.isValidElement(response);
        if (isReactElementResponse) {
          shouldDismiss = false;
          this.create({ id, type: 'default', message: response });
        } else if (isHttpResponse(response) && !response.ok) {
          shouldDismiss = false;

          const promiseData =
            typeof data.error === 'function' ? await data.error(`HTTP error! status: ${response.status}`) : data.error;

          const description =
            typeof data.description === 'function'
              ? await data.description(`HTTP error! status: ${response.status}`)
              : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (response instanceof Error) {
          shouldDismiss = false;

          const promiseData = typeof data.error === 'function' ? await data.error(response) : data.error;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        } else if (data.success !== undefined) {
          shouldDismiss = false;
          const promiseData = typeof data.success === 'function' ? await data.success(response) : data.success;

          const description =
            typeof data.description === 'function' ? await data.description(response) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'success', description, ...toastSettings });
        }
      })
      .catch(async (error) => {
        result = ['reject', error];
        if (data.error !== undefined) {
          shouldDismiss = false;
          const promiseData = typeof data.error === 'function' ? await data.error(error) : data.error;

          const description = typeof data.description === 'function' ? await data.description(error) : data.description;

          const isExtendedResult = typeof promiseData === 'object' && !React.isValidElement(promiseData);

          const toastSettings: PromiseIExtendedResult = isExtendedResult
            ? (promiseData as PromiseIExtendedResult)
            : { message: promiseData };

          this.create({ id, type: 'error', description, ...toastSettings });
        }
      })
      .finally(() => {
        if (shouldDismiss) {
          // Toast is still in load state (and will be indefinitely — dismiss it)
          this.dismiss(id);
          id = undefined;
        }

        data.finally?.();
      });

    const unwrap = () =>
      new Promise<ToastData>((resolve, reject) =>
        originalPromise.then(() => (result[0] === 'reject' ? reject(result[1]) : resolve(result[1]))).catch(reject),
      );

    if (typeof id !== 'string' && typeof id !== 'number') {
      // cannot Object.assign on undefined
      return { unwrap };
    } else {
      return Object.assign(id, { unwrap });
    }
  };

  custom = (jsx: (id: number | string) => React.ReactElement, data?: ExternalToast) => {
    const id = data?.id || toastsCounter++;
    this.create({ jsx: jsx(id), id, ...data });
    return id;
  };

  getActiveToasts = (key?: string) => {
    const activeToasts = this.toasts.filter((toast) => !this.dismissedToasts.has(toast.id));
    if (key) {
      return activeToasts.filter((toast) => ('key' in toast && toast.key === key) || (!('key' in toast) && key === 'default'));
    }
    return activeToasts;
  };
}

export const ToastState = new Observer();

// bind this to the toast function
const toastFunction = (message: titleT, data?: ExternalToast) => {
  const id = data?.id || toastsCounter++;

  ToastState.addToast({
    title: message,
    ...data,
    id,
  });
  return id;
};

const isHttpResponse = (data: any): data is Response => {
  return (
    data &&
    typeof data === 'object' &&
    'ok' in data &&
    typeof data.ok === 'boolean' &&
    'status' in data &&
    typeof data.status === 'number'
  );
};

const basicToast = toastFunction;

const getHistory = () => ToastState.toasts;
const getToasts = (key?: string) => ToastState.getActiveToasts(key);

// Create key-aware toast functions
export const createToaster = (key: string) => {
  const keyedToastFunction = (message: titleT, data?: ExternalToast) => {
    return toastFunction(message, { ...data, key });
  };

  return Object.assign(
    keyedToastFunction,
    {
      success: (message: titleT | React.ReactNode, data?: ExternalToast) => ToastState.success(message, { ...data, key }),
      info: (message: titleT | React.ReactNode, data?: ExternalToast) => ToastState.info(message, { ...data, key }),
      warning: (message: titleT | React.ReactNode, data?: ExternalToast) => ToastState.warning(message, { ...data, key }),
      error: (message: titleT | React.ReactNode, data?: ExternalToast) => ToastState.error(message, { ...data, key }),
      custom: (jsx: (id: number | string) => React.ReactElement, data?: ExternalToast) => ToastState.custom(jsx, { ...data, key }),
      message: (message: titleT | React.ReactNode, data?: ExternalToast) => ToastState.message(message, { ...data, key }),
      promise: <ToastData,>(promise: PromiseT<ToastData>, data?: PromiseData<ToastData>) => ToastState.promise(promise, { ...data, key }),
      dismiss: (id?: number | string) => ToastState.dismiss(id, key),
      loading: (message: titleT | React.ReactNode, data?: ExternalToast) => ToastState.loading(message, { ...data, key }),
    },
    { 
      getHistory: () => ToastState.toasts.filter(toast => ('key' in toast && toast.key === key) || (!('key' in toast) && key === 'default')),
      getToasts: () => ToastState.getActiveToasts(key) 
    },
  );
};

// We use `Object.assign` to maintain the correct types as we would lose them otherwise
export const toast = Object.assign(
  basicToast,
  {
    success: ToastState.success,
    info: ToastState.info,
    warning: ToastState.warning,
    error: ToastState.error,
    custom: ToastState.custom,
    message: ToastState.message,
    promise: ToastState.promise,
    dismiss: ToastState.dismiss,
    loading: ToastState.loading,
  },
  { getHistory, getToasts },
);
