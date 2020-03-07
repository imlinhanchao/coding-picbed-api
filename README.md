# Coding 图床 API
基于 [coding-picbed](https://www.npmjs.com/package/coding-picbed) Coding 图床 Node 库实现的图床 API。

# 调用方式

FormData 请求:
```html
<form action="API地址" method="post" enctype="multipart/form-data">
    <input type="file" name="f">
    <input type="submit" value="submit">
</form>
```

Axios 示例：

```html
<input class="file" name="file" type="file" onchange="upload" />

<script>
function upload() {
    let file = this.files[0];
    let param = new FormData();

    param.append('f', file);
    axios.post('API地址', param, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(rsp => {
        console.log(rsp.data);
    })
}
</script>
```

## 接口参数
|键|说明|
|--|--|
|f|文件对象|

## 响应内容
|键|说明|
|--|--|
|status|状态码|
|msg|状态信息|
|data|上传结果数据|
|- filename|文件名|
|- urls|可外链地址|

## 部署说明
- 首次部署需配置，运行 `npm run config`，按照提示输入 Coding 访问令牌，仓库名，文件大小限制和服务端口号即可；
- 运行服务只需运行 `npm start`