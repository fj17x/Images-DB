<script>
  import { page } from "$app/stores"
  import { goto } from "$app/navigation"

  const goBack = () => {
    history.back()
  }
</script>

<main>
  <div class="error-div">
    <h1 class="error-title">Error: {$page.status}</h1>
    <p class="error-message">{$page.error.message}</p>
    <div class="button-container">
      <button on:click={goBack} class="back-button">Go Back</button>
      <p class="or-text">Or</p>
      <button on:click={() => goto("/")} class="home-button">Click here to go home</button>
    </div>
  </div>
</main>

<style>
  main {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
  }

  .error-title {
    color: #d9534f;
    font-size: 24px;
    margin-bottom: 10px;
  }

  .error-message {
    margin-bottom: 20px;
    color: #555;
  }

  .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .back-button,
  .home-button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-bottom: 10px;
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  .back-button {
    background-color: #853836;
    color: #fff;
  }

  .back-button:hover {
    background-color: #c9302c;
  }

  .home-button {
    background-color: #5bc0de;
    color: #fff;
  }

  .home-button:hover {
    background-color: #46b8da;
  }

  .or-text {
    margin: 1rem 0;
    color: #777;
  }
</style>
