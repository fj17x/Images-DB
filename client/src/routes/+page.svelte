<script>
  import ChoiceModal from "$lib/components/ChoiceModal.svelte"
  import { goto } from "$app/navigation"
  import { userDetails } from "../stores/userDetails.js"

  let signedIn = $userDetails.id ? true : false
  let showChoiceModal = false
  let choiceModalOptions = {}
  choiceModalOptions.header = "Confirm logout"
  choiceModalOptions.text = "Are you sure you want to logout?"

  export const onChoiceConfirmForLogout = async (confirmed) => {
    showChoiceModal = false
    if (confirmed) {
      const response = await fetch(`http://localhost:4000/auth/logout`, {
        method: "GET",
        credentials: "include",
      })

      if (response.ok) {
        userDetails.set({})
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
</script>

<div class="hero text-white vh-100">
  <div class="overlay"></div>
  <div class="container position-relative z-index-1">
    <h2 class="hero-text"><span class="title-light fw-light">Images</span><span class="title-strong fw-bold">DB</span></h2>
    <p class="text">Share your life's snapshots.</p>

    <button on:click={handleRegister} class="btn get-started-btn">{signedIn ? "Continue" : "Create an account"}</button>
    {#if !signedIn}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div on:click={handleSignIn} class="have-account" role="button" tabindex="0">Already have an account?</div>
    {:else}
      <!-- svelte-ignore a11y-click-events-have-key-events -->
      <div on:click={() => (showChoiceModal = true)} class="have-account" role="button" tabindex="0">Logout</div>
    {/if}
  </div>
</div>

{#if showChoiceModal}
  <ChoiceModal bind:showModal={showChoiceModal} onChoiceConfirm={onChoiceConfirmForLogout} {...choiceModalOptions}></ChoiceModal>
{/if}

<style>
  .get-started-btn {
    padding: 1rem 1.8rem;
    font-size: 1.5rem;
    color: #fff;
    background-color: #1baa9e;
    border-radius: 0.5rem;
    transition: transform 0.25s ease-in-out;
  }

  .hero {
    position: relative;
    text-align: center;
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

  .hero-text {
    font-size: 4.5rem;
  }

  .text {
    font-size: 1.8rem;
    margin-top: 0px;
    margin-bottom: 1.8rem;
    font-family: cursive;
    letter-spacing: -2px;
  }

  .get-started-btn:hover {
    background-color: #1dcfc0;
    transform: scale(1.05);
  }

  .have-account {
    text-decoration: none;
    display: block;
    margin-top: 0.7rem;
    font-size: 0.9rem;
    font-weight: lighter;
    cursor: pointer;
  }

  .have-account:hover {
    text-decoration: underline;
  }
</style>
