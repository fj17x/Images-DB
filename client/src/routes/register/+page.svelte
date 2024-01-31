<script>
  const handleSubmit = async (event) => {
    const userName = event.target.userName.value
    const password = event.target.password.value
    const data = { userName, password }
    const response = await fetch(`http://localhost:4000/users/`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (response.ok) {
      alert("Successfully registered! Please sign in at login page!")
    } else {
      alert("Failed to register")
    }
    console.log(response)
  }
</script>

<h2>Register</h2>

<form on:submit|preventDefault={handleSubmit}>
  <label for="userName">Username:</label>
  <input type="text" name="userName" required />
  <label for="userName">Password:</label>
  <input type="password" name="password" required />
  <button type="submit"> Create </button>
  <a href="/login"> <p>Already registered? Click here</p></a>
</form>
