# 接口文档说明

---

## 注册 

**请求地址**		`/api/register`

**请求方式**		`POST`

**传参列表**

| 参数名               | 是否必选 | 类型    |                       说明                       |
| -------------------- | -------- | ------- | :----------------------------------------------: |
| user_id              | 是       | string  |                       账号                       |
| password             | 是       | string  |                       密码                       |
| name                 | 是       | string  |                     真实姓名                     |
| id_card              | 是       | string  |                     身份证号                     |
| verify_user_id       | 是       | string  |                    审核人账号                    |
| verify_user_relation | 是       | 1，2，3 | 与审核人关系（1：父子/母子 2：兄弟姐妹 3：夫妻） |


**响应**

``` json
0
```

**说明**

家族树需要有个根节点，所以用户列表需要有个<span style="color:red">根用户</span>，`根用户`不是一个真实的用户，不具有个人信息等。家族树的第一个用户（即家族树中的第一个家庭成员）必定是`根用户`的儿子,我们的家族树系统将这个`根用户`的账号设置为`root`，根用户的密码设置为`123`。所以家族树中第一个注册的成员，传入后台的`verify_user_id`必定是`root`，`verify_user_relation`必定是`1`,然后需要登录`根用户`的账号进行**审核**

## 登录

**请求地址**		`/api/login`

**请求方式**		`POST`

**传参列表**

| 参数名   | 是否必选 | 类型   | 说明 |
| -------- | -------- | ------ | ---- |
| user_id  | 是       | string | 账号 |
| password | 是       | string | 密码 |

**响应**

- 登录态cookies: `{ skey:"string"}`

``` json
{
    "permission": INTEGER 
    // 1或者2（1代表普通用户，2代表管理员）
}
```

**说明**

前端根据返回不同的permission值，显示不同的页面给该名用户

## 获取审核页面

**请求地址**		`/api/getReview`

**请求方式**		`GET`

**传参列表**		

- 登录态cookies: `{ skey:"string"}`

**响应**

``` json
[
    {
        "passive_user_id": "eee",
        "relation": 1
    }，
    {
	    "passive_user_id": "fff",
	    "relation": 2  
	}
	// passive_user_id指的是被审核的人的账号
	// relation指的是审核人与被审核人的关系
]
```

**说明**

用户在点击`审核页面`时，前端带着该名用户的`skey`向这个接口发起请求，以获取该名用户的审核信息

## 确认审核

**接口地址**		`/api/reviewConfirm`

**请求方式**		`GET`

**传参列表**

- 登录态cookies: `{ skey:"string"}`
| 参数名          | 是否必选 | 类型                         | 说明                   |
| --------------- | -------- | ---------------------------- | ---------------------- |
| passive_user_id | 是       | string                       | 被审核人账号           |
| relation        | 是       | 1，2                         | 被审核人与审核人的关系 |
| confirm_state   | 否       | true或者null（即不传该参数） | 审核人是否同意本次审核 |

**响应**

``` json
[
    {
        "passive_user_id": "eee",
        "relation": 1
    }，
]
```

**说明** 

用户进入审核页面以后会出现所有待审核的事件，当用户点击某个待审核事件的`同意`或者`反对`按钮时，都会触发一次对该接口的请求（同意则`confirm_state`为true，反对则不传`confirm_state`）,该接口会针对这个待审核事件进行数据库处理（若审核员同意，则在家族树上新增一个结点，反之则什么都不做），最后该接口会以数组形式再次返回当前用户的所有剩下的未处理的待审核事件，方便前端重新渲染审核页面

## 获取家族树所有结点

**接口地址**		`/api/getTree`

**请求方式**		`GET`

**传参列表**		

- 登录态cookies: `{ skey:"string"}`

**响应**

``` json
[
    {
        "id": "root",
        "parent_id": "-1",
        "name": "root",
        "children": [
            {
                "id": "aaa",
                "parent_id": "root",
                "name": "user",
                "children": [
                    {
                        "id": "ccc",
                        "parent_id": "aaa",
                        "name": "user",
                        "children": []
                    },
                    {
                        "id": "eee",
                        "parent_id": "aaa",
                        "name": "user",
                        "children": []
                    }
                ]
            },
            {
                "id": "bbb",
                "parent_id": "root",
                "name": "user",
                "children": []
            },
            {
                "id": "ddd",
                "parent_id": "root",
                "name": "user",
                "children": []
            }
        ]
    }
]
```

## 管理员直接在家族树中插入结点

**接口地址**		`/api/insertByAdmin`

**请求方式**		`GET`

**传参列表**

- 登录态cookies: `{ skey:"string"}`

| 参数名          | 是否必选 | 类型   | 说明                         |
| --------------- | -------- | ------ | ---------------------------- |
| subject_user_id | 是       | string | 已有的结点                   |
| passive_user_id | 是       | string | 准备添加的结点               |
| relation        | 是       | 1，2   | 已有的结点与待添加结点的关系 |

<span style="color:red">**此处的passive_user_id和之前审核页面的不同，敬请留意（由管理员直接进行结点插入不需要经过任何审核）**</span>

**响应**

``` json
0
```

## 管理员直接在家族树中删除结点

**接口地址**		`/api/deleteByAdmin`

**请求方式**		`GET`

**传参列表**

- 登录态cookies: `{ skey:"string"}`

**响应**

``` json
0
```

# 其他说明

## 关于错误告警

由于开发时间比较仓促，因此后台未设置一套较为规范的错误码以及日志系统用于记录后台发生的错误，目前的错误告警策略是：

- 后台发生的错误将以文字信息直接返回给前端，前端若在开发时遇到错误信息，请发上群@我一下