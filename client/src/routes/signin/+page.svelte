<script>
  const handleSubmit = async (event) => {
    const userName = event.target.userName.value.trim()
    const password = event.target.password.value.trim()
    const data = { userName, password }
    const response = await fetch(`http://localhost:4000/auth/signin`, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
    const reply = await response.json()
    if (response.ok) {
      alert(`${reply.message}`)
      window.location.href = "/dashboard"
    } else {
      alert(`${reply.error}`)
    }
  }
</script>

<h2>Please sign in</h2>

<form on:submit|preventDefault={handleSubmit}>
  <label for="userName">Username:</label>
  <input type="text" name="userName" />
  <label for="userName">Password:</label>
  <input type="password" name="password" />
  <button type="submit"> Continue </button>
  <a href="/register"> <p>New user? Click here</p></a>
</form>
