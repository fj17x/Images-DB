<script>
  import { page } from "$app/stores"
  import { goto } from "$app/navigation"

  const goBack = () => {
    history.back()
  }
</script>

<main class="error-main container-fluid d-flex justify-content-center align-items-center text-center">
  <img class="error-img w-100 h-100 position-absolute z-index-0" src="/error.jpg" alt="error sign" />
  <div>
    <h1 class="error-title fs-9">Error: {$page.status}</h1>
    <h4 class="error-message">{$page.error.message}</h4>
    <hr />
    <br />
    <div class="button-container d-flex flex-column align-items-center">
      <button on:click={goBack} class="btn back-button text-white">Go Back</button>
      <p class="or-text mt-2">Or</p>
      <button on:click={() => goto("/")} class="btn home-button text-white">Click here to go home</button>
    </div>
  </div>
</main>

<style>
  .error-main {
    height: 100vh;
  }

  .error-img {
    z-index: -1;
    opacity: 0.09;
  }
  .error-title {
    color: #d9534f;
  }

  .back-button,
  .home-button {
    transition:
      background-color 0.3s,
      color 0.3s;
  }

  .back-button {
    background-color: #853836;
  }

  .back-button:hover {
    background-color: #c9302c;
  }

  .home-button {
    background-color: #5bc0de;
  }

  .home-button:hover {
    background-color: #46b8da;
  }

  .or-text {
    color: #777;
  }
</style>
