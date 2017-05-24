# OAuth介绍

## 重要版本

1. 1.0, 1.0a 对应的rfc[rfc5849](https://tools.ietf.org/html/rfc5849)
2. 2.0 对应的rfc[rfc6749](https://tools.ietf.org/html/rfc6749)

两者不兼容，1.0更加的安全，但2是未来的主要支持的版本，所以我们以2.0为主进行介绍

## 为什么要OAuth?

1. 分享用户
2. 分享资源
3. 扩展网站能力
4. 第三方授权
5. 有限访问
6. 无密码授权

## OAuth 2

标准：[rfc6749](https://tools.ietf.org/html/rfc6749)

### 四个角色

1. resource owner（资源拥有者）

一个可以授权资源的实体。如果是一个个人是，通常是指最终用户。比如微信用户。

2. resource server（资源服务器）

拥有资源的服务器，基于访问token接受或者响应对受限资源的请求。比如微信的各种资源服务器。

3. client（客户）

请求资源的应用。不限于应用的形式，可以是服务器，桌面应用，手机应用等。比如微信公众号开发者的服务器。

4. authorization server（身份鉴权服务器）
发出访问token给client的服务器。当resource owner允许了client的授权请求后，authorization server就会生成一个token给client。

微信的登录服务器

> 注：
> 1. 2和4可以是同一个服务器
> 2. 2和4的交互不在OAuth的讨论范围


### 协议流程

     +--------+                               +---------------+
     |        |--(A)- Authorization Request ->|   Resource    |
     |        |                               |     Owner     |
     |        |<-(B)-- Authorization Grant ---|               |
     |        |                               +---------------+
     |        |
     |        |                               +---------------+
     |        |--(C)-- Authorization Grant -->| Authorization |
     | Client |                               |     Server    |
     |        |<-(D)----- Access Token -------|               |
     |        |                               +---------------+
     |        |
     |        |                               +---------------+
     |        |--(E)----- Access Token ------>|    Resource   |
     |        |                               |     Server    |
     |        |<-(F)--- Protected Resource ---|               |
     +--------+                               +---------------+

                     Figure 1: Abstract Protocol Flow


   (A)  The client requests authorization from the resource owner.  The
        authorization request can be made directly to the resource owner
        (as shown), or preferably indirectly via the authorization
        server as an intermediary.
        向拥有者发起资源授权请求

   (B)  The client receives an authorization grant, which is a
        credential representing the resource owner's authorization,
        expressed using one of four grant types defined in this
        specification or using an extension grant type.  The
        authorization grant type depends on the method used by the
        client to request authorization and the types supported by the
        authorization server.
        从拥有者获得资源授权

   (C)  The client requests an access token by authenticating with the
        authorization server and presenting the authorization grant.
        向身份鉴权服务器发起资源鉴权请求

   (D)  The authorization server authenticates the client and validates
        the authorization grant, and if valid, issues an access token.
        身份鉴权成功，并获得Token

   (E)  The client requests the protected resource from the resource
        server and authenticates by presenting the access token.
        向资源服务器发起基于Token请求资源

   (F)  The resource server validates the access token, and if valid,
        serves the request.
        获得基于Token的资源



### 客户注册（Client Registration）

客户需要事先在authorization server（身份鉴权服务器）上注册。

注册的过程可以多样。包括普通的表单注册。

必须完成的工作有：

1. 客户类型
2. 重定向URI
3. 其它服务器要求的信息（比如密钥）

客户类型：
1. confidential

  客户有自信维护好这些授权信息。比如它的服务器的访问是有很好的权限限制的。

2. public
  客户并没自信维护好这些授权信息。比如客户在某个原生应用或者浏览器应用上。


### 客户标识（Client Identifier）

Client Identifier是一个唯一的字符串，用于在authorization server（身份鉴权服务器）上标记client身份。

长度没有限定，但是authorization server（身份鉴权服务器）应该说明这个ID的长度。

对应于微信里的appId.

### 客户鉴权

1. 密码方式（Client Password）

客户可以是否采用HTTP Basic的方式来鉴权是可选的，但是服务器是必须支持的。

```
     Authorization: Basic czZCaGRSa3F0Mzo3RmpmcDBaQnIxS3REUmJuZlZkbUl3
```

必传的两个参数（而必须是通过POST发送）：

```
   client_id
         REQUIRED.  The client identifier issued to the client during
         the registration process described by Section 2.2.

   client_secret
         REQUIRED.  The client secret.  The client MAY omit the
         parameter if the client secret is an empty string.
```

2. 示例

更新access token：

```
     POST /token HTTP/1.1
     Host: server.example.com
     Content-Type: application/x-www-form-urlencoded

     grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA
     &client_id=s6BhdRkqt3&client_secret=7Fjfp0ZBr1KtDRbnfVdmIw
```

### 身份授权（Authorization Grant）

身份授权是一个对资源拥有者授权的可信代表。通过授权，client可以获得访问token。

标准里定义了四个类型的身份授权：

1. 身份代码（Authorization Code）
2. 隐性授权（Implicit）
3. 密码授权（resource owner password）
   credentials
4. 客户信任（client credentials）

同时也允许自定义授权类型。


#### Authorization Code

图示：

```

     +----------+
     | Resource |
     |   Owner  |
     |          |
     +----------+
          ^
          |
         (B)
     +----|-----+          Client Identifier      +---------------+
     |         -+----(A)-- & Redirection URI ---->|               |
     |  User-   |                                 | Authorization |
     |  Agent  -+----(B)-- User authenticates --->|     Server    |
     |          |                                 |               |
     |         -+----(C)-- Authorization Code ---<|               |
     +-|----|---+                                 +---------------+
       |    |                                         ^      v
      (A)  (C)                                        |      |
       |    |                                         |      |
       ^    v                                         |      |
     +---------+                                      |      |
     |         |>---(D)-- Authorization Code ---------'      |
     |  Client |          & Redirection URI                  |
     |         |                                             |
     |         |<---(E)----- Access Token -------------------'
     +---------+       (w/ Optional Refresh Token)

   Note: The lines illustrating steps (A), (B), and (C) are broken into
   two parts as they pass through the user-agent.

                     Figure 3: Authorization Code Flow

```

1. 鉴权请求（Authorization Request）：

数据格式要求是"application/x-www-form-urlencoded"的。

参数：

```
   response_type
         REQUIRED.  Value MUST be set to "code".

   client_id
         REQUIRED.  The client identifier as described in Section 2.2.

   redirect_uri
         OPTIONAL.  As described in Section 3.1.2.

   scope
         OPTIONAL.  The scope of the access request as described by
         Section 3.3.

   state
         RECOMMENDED.  An opaque value used by the client to maintain
         state between the request and callback.  The authorization
         server includes this value when redirecting the user-agent back
         to the client.  The parameter SHOULD be used for preventing
         cross-site request forgery as described in Section 10.12.
```

示例：

```
    GET /authorize?response_type=code&client_id=s6BhdRkqt3&state=xyz
        &redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb HTTP/1.1
    Host: server.example.com
```


2. 鉴权返回（Authorization Response）：

```
   code
         REQUIRED.  The authorization code generated by the
         authorization server.  The authorization code MUST expire
         shortly after it is issued to mitigate the risk of leaks.  A
         maximum authorization code lifetime of 10 minutes is
         RECOMMENDED.  The client MUST NOT use the authorization code
         more than once.  If an authorization code is used more than
         once, the authorization server MUST deny the request and SHOULD
         revoke (when possible) all tokens previously issued based on
         that authorization code.  The authorization code is bound to
         the client identifier and redirection URI.

   state
         REQUIRED if the "state" parameter was present in the client
         authorization request.  The exact value received from the
         client.
```

示例：

```
     HTTP/1.1 302 Found
     Location: https://client.example.com/cb?code=SplxlOBeZQQYbYS6WxSbIA
               &state=xyz
```

3. 错误返回（Error Response）


```
   error
         REQUIRED.  A single ASCII [USASCII] error code from the
         following:

         invalid_request
               The request is missing a required parameter, includes an
               invalid parameter value, includes a parameter more than
               once, or is otherwise malformed.

         unauthorized_client
               The client is not authorized to request an authorization
               code using this method.

         access_denied
               The resource owner or authorization server denied the
               request.

         unsupported_response_type
               The authorization server does not support obtaining an
               authorization code using this method.

         invalid_scope
               The requested scope is invalid, unknown, or malformed.

         server_error
               The authorization server encountered an unexpected
               condition that prevented it from fulfilling the request.
               (This error code is needed because a 500 Internal Server
               Error HTTP status code cannot be returned to the client
               via an HTTP redirect.)

         temporarily_unavailable
               The authorization server is currently unable to handle
               the request due to a temporary overloading or maintenance
               of the server.  (This error code is needed because a 503
               Service Unavailable HTTP status code cannot be returned
               to the client via an HTTP redirect.)

         Values for the "error" parameter MUST NOT include characters
         outside the set %x20-21 / %x23-5B / %x5D-7E.

   error_description
         OPTIONAL.  Human-readable ASCII [USASCII] text providing
         additional information, used to assist the client developer in
         understanding the error that occurred.
         Values for the "error_description" parameter MUST NOT include
         characters outside the set %x20-21 / %x23-5B / %x5D-7E.

   error_uri
         OPTIONAL.  A URI identifying a human-readable web page with
         information about the error, used to provide the client
         developer with additional information about the error.
         Values for the "error_uri" parameter MUST conform to the
         URI-reference syntax and thus MUST NOT include characters
         outside the set %x21 / %x23-5B / %x5D-7E.
   state
         REQUIRED if a "state" parameter was present in the client
         authorization request.  The exact value received from the
         client.

```

示例：

```
 HTTP/1.1 302 Found
   Location: https://client.example.com/cb?error=access_denied&state=xyz
```

4. 访问Token请求（Access Token Request）


```
   grant_type
         REQUIRED.  Value MUST be set to "authorization_code".

   code
         REQUIRED.  The authorization code received from the
         authorization server.

   redirect_uri
         REQUIRED, if the "redirect_uri" parameter was included in the
         authorization request as described in Section 4.1.1, and their
         values MUST be identical.

   client_id
         REQUIRED, if the client is not authenticating with the
         authorization server as described in Section 3.2.1.

```

示例：

```
     POST /token HTTP/1.1
     Host: server.example.com
     Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
     Content-Type: application/x-www-form-urlencoded

     grant_type=authorization_code&code=SplxlOBeZQQYbYS6WxSbIA
     &redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb
```

5. 访问Token响应（Access Token Response）

示例：

```

HTTP/1.1 200 OK
     Content-Type: application/json;charset=UTF-8
     Cache-Control: no-store
     Pragma: no-cache

     {
       "access_token":"2YotnFZFEjr1zCsicMWpAA",
       "token_type":"example",
       "expires_in":3600,
       "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
       "example_parameter":"example_value"
     }

```

#### Implicit


```
     +----------+
     | Resource |
     |  Owner   |
     |          |
     +----------+
          ^
          |
         (B)
     +----|-----+          Client Identifier     +---------------+
     |         -+----(A)-- & Redirection URI --->|               |
     |  User-   |                                | Authorization |
     |  Agent  -|----(B)-- User authenticates -->|     Server    |
     |          |                                |               |
     |          |<---(C)--- Redirection URI ----<|               |
     |          |          with Access Token     +---------------+
     |          |            in Fragment
     |          |                                +---------------+
     |          |----(D)--- Redirection URI ---->|   Web-Hosted  |
     |          |          without Fragment      |     Client    |
     |          |                                |    Resource   |
     |     (F)  |<---(E)------- Script ---------<|               |
     |          |                                +---------------+
     +-|--------+
       |    |
      (A)  (G) Access Token
       |    |
       ^    v
     +---------+
     |         |
     |  Client |
     |         |
     +---------+

   Note: The lines illustrating steps (A) and (B) are broken into two
   parts as they pass through the user-agent.

                       Figure 4: Implicit Grant Flow
```

1. 鉴权请求（Authorization Request）

参数：

```
   response_type
         REQUIRED.  Value MUST be set to "token".

   client_id
         REQUIRED.  The client identifier as described in Section 2.2.

   redirect_uri
         OPTIONAL.  As described in Section 3.1.2.

   scope
         OPTIONAL.  The scope of the access request as described by
         Section 3.3.

   state
         RECOMMENDED.  An opaque value used by the client to maintain
         state between the request and callback.  The authorization
         server includes this value when redirecting the user-agent back
         to the client.  The parameter SHOULD be used for preventing
         cross-site request forgery as described in Section 10.12.
```
示例：

```
    GET /authorize?response_type=token&client_id=s6BhdRkqt3&state=xyz
        &redirect_uri=https%3A%2F%2Fclient%2Eexample%2Ecom%2Fcb HTTP/1.1
    Host: server.example.com
```

2. 访问Token响应（Access Token Response）

参数：

```
   access_token
         REQUIRED.  The access token issued by the authorization server.

   token_type
         REQUIRED.  The type of the token issued as described in
         Section 7.1.  Value is case insensitive.

   expires_in
         RECOMMENDED.  The lifetime in seconds of the access token.  For
         example, the value "3600" denotes that the access token will
         expire in one hour from the time the response was generated.
         If omitted, the authorization server SHOULD provide the
         expiration time via other means or document the default value.

   scope
         OPTIONAL, if identical to the scope requested by the client;
         otherwise, REQUIRED.  The scope of the access token as
         described by Section 3.3.

   state
         REQUIRED if the "state" parameter was present in the client
         authorization request.  The exact value received from the
         client.
```

示例：
```
     HTTP/1.1 302 Found
     Location: http://example.com/cb#access_token=2YotnFZFEjr1zCsicMWpAA
               &state=xyz&token_type=example&expires_in=3600
```

3. 错误返回（Error Response）

同上


#### Resource Owner Password Credentials Grant

```
     +----------+
     | Resource |
     |  Owner   |
     |          |
     +----------+
          v
          |    Resource Owner
         (A) Password Credentials
          |
          v
     +---------+                                  +---------------+
     |         |>--(B)---- Resource Owner ------->|               |
     |         |         Password Credentials     | Authorization |
     | Client  |                                  |     Server    |
     |         |<--(C)---- Access Token ---------<|               |
     |         |    (w/ Optional Refresh Token)   |               |
     +---------+                                  +---------------+

            Figure 5: Resource Owner Password Credentials Flow
```

1. 访问Token请求（Access Token Request）

参数：

```
   grant_type
         REQUIRED.  Value MUST be set to "password".

   username
         REQUIRED.  The resource owner username.

   password
         REQUIRED.  The resource owner password.

   scope
         OPTIONAL.  The scope of the access request as described by
         Section 3.3.
```

示例：

```
     POST /token HTTP/1.1
     Host: server.example.com
     Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
     Content-Type: application/x-www-form-urlencoded

     grant_type=password&username=johndoe&password=A3ddj3w
```

2. 访问Token响应（Access Token Response）

```
     HTTP/1.1 200 OK
     Content-Type: application/json;charset=UTF-8
     Cache-Control: no-store
     Pragma: no-cache

     {
       "access_token":"2YotnFZFEjr1zCsicMWpAA",
       "token_type":"example",
       "expires_in":3600,
       "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
       "example_parameter":"example_value"
     }
```

#### Client Credentials Grant

```
     +---------+                                  +---------------+
     |         |                                  |               |
     |         |>--(A)- Client Authentication --->| Authorization |
     | Client  |                                  |     Server    |
     |         |<--(B)---- Access Token ---------<|               |
     |         |                                  |               |
     +---------+                                  +---------------+

                     Figure 6: Client Credentials Flow

```

1. 访问Token请求（Access Token Request）

参数：

```
   grant_type
         REQUIRED.  Value MUST be set to "client_credentials".

   scope
         OPTIONAL.  The scope of the access request as described by
         Section 3.3.
```

示例：

```
     POST /token HTTP/1.1
     Host: server.example.com
     Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
     Content-Type: application/x-www-form-urlencoded

     grant_type=client_credentials
```

2. 访问Token响应（Access Token Response）

```

     HTTP/1.1 200 OK
     Content-Type: application/json;charset=UTF-8
     Cache-Control: no-store
     Pragma: no-cache

     {
       "access_token":"2YotnFZFEjr1zCsicMWpAA",
       "token_type":"example",
       "expires_in":3600,
       "example_parameter":"example_value"
     }
```     

####  Extension Grants

grant_type是一个绝对的URI地址。

示例：
```
     POST /token HTTP/1.1
     Host: server.example.com
     Content-Type: application/x-www-form-urlencoded

     grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Asaml2-
     bearer&assertion=PEFzc2VydGlvbiBJc3N1ZUluc3RhbnQ9IjIwMTEtMDU
     [...omitted for brevity...]aG5TdGF0ZW1lbnQ-PC9Bc3NlcnRpb24-
```


### Access Token

1. 对client不透明
2. 代表一些scope以及一段可访问时间

#### 生成一个Token

1. 成功的返回：

```
   access_token
         REQUIRED.  The access token issued by the authorization server.

   token_type
         REQUIRED.  The type of the token issued as described in
         Section 7.1.  Value is case insensitive.

   expires_in
         RECOMMENDED.  The lifetime in seconds of the access token.  For
         example, the value "3600" denotes that the access token will
         expire in one hour from the time the response was generated.
         If omitted, the authorization server SHOULD provide the
         expiration time via other means or document the default value.

   refresh_token
         OPTIONAL.  The refresh token, which can be used to obtain new
         access tokens using the same authorization grant as described
         in Section 6.

   scope
         OPTIONAL, if identical to the scope requested by the client;
         otherwise, REQUIRED.  The scope of the access token as
         described by Section 3.3.

```

示例：

```
     HTTP/1.1 200 OK
     Content-Type: application/json;charset=UTF-8
     Cache-Control: no-store
     Pragma: no-cache

     {
       "access_token":"2YotnFZFEjr1zCsicMWpAA",
       "token_type":"example",
       "expires_in":3600,
       "refresh_token":"tGzv3JOkF0XG5Qx2TlKWIA",
       "example_parameter":"example_value"
     }
```

2. 错误的返回：

格式同上

```
     HTTP/1.1 400 Bad Request
     Content-Type: application/json;charset=UTF-8
     Cache-Control: no-store
     Pragma: no-cache

     {
       "error":"invalid_request"
     }
```

### Refresh Token

1. 更新Access Token

2. 不必资源拥有者参与

```

  +--------+                                           +---------------+
  |        |--(A)------- Authorization Grant --------->|               |
  |        |                                           |               |
  |        |<-(B)----------- Access Token -------------|               |
  |        |               & Refresh Token             |               |
  |        |                                           |               |
  |        |                            +----------+   |               |
  |        |--(C)---- Access Token ---->|          |   |               |
  |        |                            |          |   |               |
  |        |<-(D)- Protected Resource --| Resource |   | Authorization |
  | Client |                            |  Server  |   |     Server    |
  |        |--(E)---- Access Token ---->|          |   |               |
  |        |                            |          |   |               |
  |        |<-(F)- Invalid Token Error -|          |   |               |
  |        |                            +----------+   |               |
  |        |                                           |               |
  |        |--(G)----------- Refresh Token ----------->|               |
  |        |                                           |               |
  |        |<-(H)----------- Access Token -------------|               |
  +--------+           & Optional Refresh Token        +---------------+

               Figure 2: Refreshing an Expired Access Token

```

3. 请求格式：

```
   grant_type
         REQUIRED.  Value MUST be set to "refresh_token".

   refresh_token
         REQUIRED.  The refresh token issued to the client.

   scope
         OPTIONAL.  The scope of the access request as described by
         Section 3.3.  The requested scope MUST NOT include any scope
         not originally granted by the resource owner, and if omitted is
         treated as equal to the scope originally granted by the
         resource owner.
```

示例：

```
     POST /token HTTP/1.1
     Host: server.example.com
     Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW
     Content-Type: application/x-www-form-urlencoded

     grant_type=refresh_token&refresh_token=tGzv3JOkF0XG5Qx2TlKWIA
```












