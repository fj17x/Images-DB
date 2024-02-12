<script>
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { goto } from "$app/navigation"

  let showAlertModal = false
  let alertModalOptions = {}

  let isLoading = false
  let userName
  let password
  let confirmPassword

  const handleRegister = async () => {
    try {
      isLoading = true

      if (password.trim() !== confirmPassword.trim()) {
        alertModalOptions.header = "Could not register"
        alertModalOptions.message = "Password does not match."
        alertModalOptions.type = "failure"
        showAlertModal = true
        isLoading = false
        return
      }
      const data = { userName: userName.trim(), password: password.trim() }
      const response = await fetch(`http://localhost:4000/auth/register`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      })
      const reply = await response.json()
      if (response.ok) {
        alertModalOptions.header = "Registered successfully"
        alertModalOptions.message = reply.message
        alertModalOptions.type = "success"
        showAlertModal = true
      } else {
        alertModalOptions.header = "Could not register"
        alertModalOptions.message = `${reply.error}`
        alertModalOptions.type = "failure"
        showAlertModal = true
      }
      isLoading = false
    } catch (err) {
      alertModalOptions.header = "Sign in failed"
      alertModalOptions.message = `Server may be down!`
      alertModalOptions.type = "failure"
      showAlertModal = true
      isLoading = false
    }
  }

  const onAlertConfirm = () => {
    if (alertModalOptions.type === "success") {
      goto("/signin")
    }
    showAlertModal = false
  }
</script>

<div class="outer-section container-fluid vh-100 d-flex justify-content-center align-items-center">
  <div class="form-content bg-white p-4">
    <div class="login-form">
      <p class="title mt-0 fw-semibold">Register</p>
      <form on:submit|preventDefault={handleRegister}>
        <div class="input-boxes">
          <div class="d-flex align-items-center my-3 mx-1">
            <i class="fas fa-user"></i>
            <!-- svelte-ignore a11y-autofocus -->
            <input
              class="input-field"
              autofocus
              type="text"
              placeholder="Enter your username"
              name="userName"
              bind:value={userName}
              required
            />
          </div>
          <div class="d-flex align-items-center my-3 mx-1">
            <i class="fas fa-lock"></i>
            <input
              class="input-field"
              type="password"
              placeholder="Enter your password"
              name="password"
              bind:value={password}
              required
            />
          </div>
          <div class="d-flex align-items-center my-3 mx-1">
            <i class="fas fa-lock"></i>
            <input
              class="input-field"
              type="password"
              placeholder="Confirm your password"
              name="confirmPassword"
              bind:value={confirmPassword}
              required
            />
          </div>
          <div class="submit-div">
            <button type="submit" class="btn submit-button w-100 p-2 text-white">
              {#if isLoading}
                <i class="fas fa-spinner fa-spin"></i>
              {:else}
                Submit
              {/if}</button
            >
          </div>
          <div class="text"><a href="/signin" class="links">Already registered? Sign in here!</a></div>
          <div class="text"><a href="/" class="links"> Go Back</a></div>
        </div>
      </form>
    </div>
  </div>
</div>
{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions} {onAlertConfirm}></AlertModal>
{/if}

<style>
  .outer-section {
    animation: continuousBackground 4.5s infinite alternate;
  }

  .title {
    font-size: 1.5rem;
    color: #333;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
    white-space: nowrap;
    animation: typewriter 0.5s steps(20);
  }

  .form-content {
    max-width: 500px;
    width: 100%;
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    border-radius: 1%;
  }

  .input-field {
    width: 100%;
    outline: none;
    border: none;
    padding: 10px;
    font-size: 0.9rem;
    border-bottom: 2px solid rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
  }

  .input-field {
    border-color: #199f94;
  }

  .text {
    font-size: 14px;
    font-weight: 500;
    text-align: center;
    margin-top: 1rem;
    text-decoration: none;
  }

  .links {
    text-decoration: none;
  }

  .submit-button {
    background: #85c482;
    border-radius: 1%;
    transition: all 1s ease;
    border: none;
  }

  .submit-div:hover {
    background: green;
    transform: scale(1.01);
  }
  .submit-div:active {
    transform: scale(0.98);
    box-shadow: 3px 2px 22px 1px rgba(0, 0, 0, 0.24);
  }

  @keyframes continuousBackground {
    0% {
      background-color: #198f94;
    }
    100% {
      background-color: #19af94;
    }
  }
  @keyframes typewriter {
    from {
      width: 0;
    }
    to {
      width: 100%;
    }
  }
</style>
