<script>
  import { page } from "$app/stores"
  import { goto } from "$app/navigation"

  const goBack = () => {
    history.back()
  }
</script>

<main class="error-main">
  <img class="error-img" src="/error.jpg" alt="error sign" />
  <div>
    <h1 class="error-title">Error: {$page.status}</h1>
    <h4 class="error-message">{$page.error.message}</h4>
    <hr />
    <br />
    <div class="button-container">
      <button on:click={goBack} class="back-button">Go Back</button>
      <p class="or-text">Or</p>
      <button on:click={() => goto("/")} class="home-button">Click here to go home</button>
    </div>
  </div>
</main>

<style>
  .error-main {
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    padding: 20px;
  }

  .error-img {
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    opacity: 0.09;
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
