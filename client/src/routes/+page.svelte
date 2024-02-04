<script>
  import { onMount } from "svelte"
  import ChoiceModal from "$lib/components/ChoiceModal.svelte"
  import { goto } from "$app/navigation"

  let signedIn = false
  let showChoiceModal = false
  let choiceModalOptions = {}
  choiceModalOptions.header = "Confirm logout"
  choiceModalOptions.text = "Are you sure you want to logout?"

  const checkSignedIn = async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })

    if (response.ok) {
      signedIn = true
    }
  }

  export const onChoiceConfirm = async (confirmed) => {
    if (confirmed) {
      const response = await fetch(`http://localhost:4000/auth/logout`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        goto("/register")
      }
    }
  }
  const handleRegister = async () => {
    if (signedIn) {
      goto("/dashboard/myimages")
    } else {
      goto("/register")
    }
  }

  const handleSignIn = async () => {
    if (signedIn) {
      goto("/dashboard/myimages")
    } else {
      goto("/signin")
    }
  }

  onMount(async () => {
    await checkSignedIn()
  })
</script>

<div class="hero">
  <div class="overlay"></div>
  <div class="hero-content">
    <h1><span class="title-light">Images</span><span class="title-strong">DB</span></h1>
    <p class="text">Share your life's snapshots.</p>
    {#await checkSignedIn()}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:then}
      <div on:click={handleRegister} class="get-started-btn">{signedIn ? "Continue" : "Create an account"}</div>
      {#if !signedIn}
        <div on:click={handleSignIn} class="have-account">Already have an account?</div>
      {:else}
        <div on:click={() => (showChoiceModal = true)} class="have-account">Logout</div>
      {/if}
    {:catch}
      <p class="have-account">Failed to connect to application.</p>
    {/await}
  </div>
</div>

{#if showChoiceModal}
  <ChoiceModal bind:showModal={showChoiceModal} {onChoiceConfirm} {...choiceModalOptions}></ChoiceModal>
{/if}

<style>
  .hero {
    height: 100vh;
    position: relative;
    text-align: center;
    color: #fff;
    background: url("/background.jpg") center/cover no-repeat;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.4);
  }

  .hero-content {
    position: relative;
    z-index: 1;
  }

  .title-light {
    font-weight: lighter;
  }
  .title-strong {
    font-weight: bold;
  }

  .hero h1 {
    font-size: 4.5rem;
    margin: 0px auto;
  }

  .text {
    font-size: 1.8rem;
    margin-top: 0px;
    margin-bottom: 3.4rem;
    font-family: cursive;
    letter-spacing: -2px;
  }

  .get-started-btn {
    display: inline-block;
    padding: 1rem 1.8rem;
    font-size: 1.5rem;
    text-decoration: none;
    color: #fff;
    background-color: #1baa9e;
    border-radius: 0.5rem;
    cursor: pointer;
    transition:
      background-color 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }

  .get-started-btn:hover {
    background-color: #1dcfc0;
    transform: scale(1.05);
  }

  .have-account {
    text-decoration: none;
    display: block;
    margin-top: 0.7rem;
    color: white;
    font-size: 0.9rem;
    font-weight: lighter;
    cursor: pointer;
  }

  .have-account:hover {
    text-decoration: underline;
  }
</style>
