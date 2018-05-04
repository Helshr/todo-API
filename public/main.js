// ajax
const ajax = function(method, path, data, reseponseCallback) {
    let r = new XMLHttpRequest()
    r.open(method, path, true)
    r.setRequestHeader('Content-Type', 'application/json')
    r.onreadystatechange = function() {
        // readyState == 4 表示请求结束并且得到了服务器给的响应数据
        if (r.readyState === 4) {
            console.log('state change', r, r.status, r.response)
            reseponseCallback(r.response)
        } else {
            console.log('change')
        }
    }
    r.send(data)
}

const e = (selector) => {
    return document.querySelector(selector)
}

const log = console.log.bind(console)

// 辅助函数，检查 div是否有该 class，有则移除，没有则添加
const toggleClass = (element, className) => {
    if (element.classList.contains(className)) {
        element.classList.remove(className)
    } else {
        element.classList.add(className)
    }
}

// todo模版
const templateTodo = (id, item, done) => {
    let t = `<div class="todo-cell ${done} voiceList" data-id=${id}><span contenteditable="false" class="show-cell">${item}</span><button class="todo-edit-cell">修改</button><button class="todo-delete-cell">删除</button><button class="todo-finish-cell">完成</button></div>`
    return t
}

// 添加 item事件
const addItemEvent = () => {
    const addBtn = e('.add-item')
    const conatiner = e('#id-div-container')
    addBtn.addEventListener('click', (event) => {
        // 阻止默认表单提交事件
        event.preventDefault()
        const iptValue = e('.input-item').value
        log('value: ', iptValue)
        let todo = {
            item: iptValue
        }
        log('todo: ', todo)
        e('.input-item').value = ''
        todo = JSON.stringify(todo)
        ajax('post', '/add', todo, (r) => {
            let t = JSON.parse(r)
            let tId = t.id
            let tItem = t.item
            // 将接收到的数据发送给模版字符串
            let item = templateTodo(tId, tItem)
            // 将新增加的 item插入页面
            conatiner.insertAdjacentHTML('beforeend', item)
        })
    })
}

// 添加删除事件
const deleteItemEvent = () => {
    // 为父节点绑定事件，进行事件委托
    const conatiner = e('#id-div-container')
    conatiner.addEventListener('click', (event) => {
        let target = event.target
        // 获取点击元素的父节点
        let parentEle = target.parentElement
        // 获取该 div的 id
        let parentEleId = parentEle.getAttribute("data-id")
        if (target.classList.contains('todo-delete-cell')) {
            let item = {
                id: parentEleId
            }
            // 序列化后利用 ajax发送
            item = JSON.stringify(item)
            ajax('post', '/delete', item, (r) => {
                log('delete result: ', r)
            })
            // 在当前页面删除元素
            parentEle.remove()
        }
    })
}

// 添加修改事件
const editItemEvent = () => {
    // 为父节点绑定事件，进行事件委托
    const conatiner = e('#id-div-container')
    conatiner.addEventListener('click', (event) => {
        let target = event.target
        // 获取点击元素的父节点
        let parentEle = target.parentElement
        // 获取该 div的 id
        let parentEleId = parentEle.getAttribute("data-id")
        if (target.classList.contains('todo-edit-cell')) {
            // 找到当前要编辑的 span
            const span = parentEle.querySelector('.show-cell')
            // 将可编辑属性改为 true
            span.contentEditable = true
            changeItemEvent(span, parentEleId)
        }
    })
}

// 添加编辑事件
const changeItemEvent = (element, id) => {
    element.addEventListener('keydown', (event) => {
        log('event: ', event)
        if (event.key === 'Enter') {
            // 阻止默认换行事件
            event.preventDefault()
            // 将可编辑属性改为 false
            element.contentEditable = false
            // 获取修改后的 input
            let t = element.innerText
            let item = {
                item: t,
                id: id
            }
            // 序列化后发送数据
            item = JSON.stringify(item)
            // 并发送 ajax
            ajax('post', '/edit', item, (r) => {
                log('edit result: ', r)
            })
        }
    })
}

// 添加完成事件
const finishItemEvent = () => {
    // 为父节点绑定事件，进行事件委托
    const conatiner = e('#id-div-container')
    conatiner.addEventListener('click', (event) => {
        let target = event.target
        // 获取点击元素的父节点
        let parentEle = target.parentElement
        // 获取该 div的 id
        let parentEleId = parentEle.getAttribute("data-id")
        if (target.classList.contains('todo-finish-cell')) {
            // toggleClass
            toggleClass(parentEle, 'done')
            // 检查该元素是否含有 'done', 若没有则发送 false，否则发送true
            let t = parentEle.classList.contains('done')
            let item = {
                id: parentEleId,
                done: t
            }
            item = JSON.stringify(item)
            ajax('post', '/finish', item, (r) => {

            })
        }
    })
}

const bindEvent = () => {
    addItemEvent()
    deleteItemEvent()
    editItemEvent()
    finishItemEvent()
}

// 初始化页面
const initData = () => {
    const container = e('#id-div-container')
    ajax('get', '/get', '', (r) => {
        let todos = JSON.parse(r)
        todos.forEach((todo) => {
            // 检查todo.done 是否为 true
            // 若为true, 则添加 'done'
            // 否则添加一个空字符串
            let done = ''
            if (todo.done) {
                done = 'done'
            }
            let t = templateTodo(todo.id, todo.item, done)
            container.insertAdjacentHTML('beforeend', t)
        })

    })
}

const __main = () => {
    initData()
    bindEvent()
}

window.onload = __main()