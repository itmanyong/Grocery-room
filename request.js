/*
 * @Author: itmanyong
 * @Date: 2021-03-31 10:44:59
 * @LastEditors: itmanyong
 * @Description: axios请求库封装
 * @LastEditTime: 2021-03-31 13:13:22
 */

import axios from "axios";
/**
 * URL白名单,无需携带TOKEN-一般后端会做处理,这里配置主要是防止请求拦截中检测TOKEN
 */
const whiteUrls = [];
/**
 * 状态码提示设置
 */
const errorTips = {
	400: "请求错误,请检查",
	401: "授权失效/未登录,请重新登录",
	403: "禁止访问,服务器拒绝/资源损坏",
	404: "请求失败,相关资源未找到",
	405: "请求的资源不允许使用此方法访问",
	406: "Accept头类型不正确",
	407: "代理服务器需要认证信息",
	408: "请求超时,请稍候再试",
	409: "文件版本有误,请确认后再试",
	410: "当前资源已被转移,无法正确访问",
	411: "当前请求无法处理",
	412: "请求头信息错误,无法处理",
	413: "请求资源过大,无法处理",
	414: "URL过长,无法处理",
	415: "请求参数类型无效,无法处理",
	500: "服务器内部错误",
	501: "服务器不支持当前请求类型",
	502: "网关代理错误,请检查",
	503: "服务器维护/超载,暂无法处理",
	504: "网关超时,请稍候再试",
	505: "服务器不支持当前请求的HTTP版本",
};

/**
 * axios请求实例
 */
const instance = axios.create({
	baseURL: ``,
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
	responseType: "json",
	withCredentials: false,
});

/**
 * 请求拦截器
 */
instance.interceptors.request.use(
	(config) => {
		// 1.识别白名单
		if (!whiteUrls.some((url) => config.url.indexOf(url) != -1)) {
			// 添加TOKEN-没有TOKEN去登陆
		}
		// 2.加密

		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

instance.interceptors.response.use(
	(response) => {
		// 1.解密
		// 2.返回
		return Promise.resolve(response.data);
	},
	(error) => {
		const { response } = error;
		// 2.异常提示
		let errorText = errorTips[response.status] || `请求响应异常,请稍后再试!`;
		if (response.data) {
			errorText = response.data.msg || response.data.message || errorText;
		}
		// 3.异常处理
		switch (response.status) {
			case 401:
				// 跳去登录/授权
				break;
		}
		return Promise.reject(errorText);
	}
);

const renderObj = {
	code: 0,
	data: null,
	msg: "",
};
/**
 * 请求函数
 * @param {object} options 请求参数
 * @returns promise object
 */
function request(options) {
	const {
		url = "",
		method = "GET",
		data = null,
		urlTemplate = null,
		isTip = true,
		// configProps参见 http://www.axios-js.com/zh-cn/docs/ 中的请求配置
		...configProps
	} = options;

	// 1.替换模板参数获取新URL
	const newUrl = mapUrlRegx(url, urlTemplate);
	// 2.组合参数
	const params = {
		url: newUrl,
		method: method,
	};
	if (data && ["POST", "PUT", "PATCH"].some((l) => l === method)) {
		params.data = data;
	} else {
		params.params = data;
	}
	return new Promise((resolve, reject) => {
		instance
			.request({ ...params, ...configProps })
			.then((result) => {
				resolve({
					...renderObj,
					code: 1,
					data: result,
					msg: "OK",
				});
			})
			.catch((error) => {
				// 进行提示
				resolve({
					...renderObj,
					msg: JSON.stringify(error),
				});
			});
	});
}
export default request;
/**
 * 替换URL中非params参数
 * @param {string} url URL
 * @param {object} urldata URL中的替换参数
 * @example URL中的模板参数使用`{keyName}||[keyName]`定义;例如:/api/v1/{id}/[name]
 * @example urldata定义为对象,属性值为keyName,无需带括号
 * @returns newUrl to string
 */
const mapUrlRegx = (url, urldata) => {
	if (urldata) {
		let reg = /\{[a-zA-Z0-9]*\}|\[[a-zA-Z0-9]*\]/g;
		let match = url.match(reg);
		if (match) {
			for (let m of match) {
				m = m
					.replace("{", "")
					.replace("}", "")
					.replace("[", "")
					.replace("]", "");
				let urltmp = urldata[m];
				url = url
					.replace(
						`{${m}}`,
						`${typeof urltmp === "string" ? `'${urltmp}'` : urltmp}`
					)
					.replace(`[${m}]`, urltmp);
			}
		}
	}
	return url;
};
