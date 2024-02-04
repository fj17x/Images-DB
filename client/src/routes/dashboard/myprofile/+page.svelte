<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { onMount } from "svelte"

  let showAlertModal = false
  let alertModalOptions = {}
  let userData = {}
  let imagesUploaded = 0

  const getUserDetails = async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })
    const reply = await response.json()
    userData = reply.data
    imagesUploaded = userData.imagesUploaded.length
    console.log("🚀 ~ getUserDetails ~ userData:", userData.imagesUploaded)
    if (response.ok) {
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    const formattedDate = new Date(dateString).toLocaleDateString("en-US", options)
    return formattedDate
  }

  const handleDeleteAccount = async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "DELETE",
      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      alertModalOptions.header = "Operation succeeded"
      alertModalOptions.message = reply.message
      alertModalOptions.type = "success"
      showAlertModal = true
    } else {
      alertModalOptions.header = "Operation failed"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  onMount(async () => {
    await getUserDetails()
  })
</script>

<div class="container">
  <Dashboard />
  <div class="content">
    {#await getUserDetails()}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:then}
      <h3>Your Profile:</h3>
      <div class="main-card">
        <div class="profile-info">
          <span class="bar">
            <p class="property">User ID:</p>
            <p>{userData.id}</p>
          </span>
          <hr />
          <span class="bar">
            <p class="property">Name:</p>
            <p>{userData.userName}</p>
          </span>
          <hr />
          <span class="bar">
            <p class="property">Profile created on</p>
            <p>{formatDate(userData.createdAt)}</p>
          </span>
          <hr />
          <span class="bar">
            <p class="property">Profile Last modified on:</p>
            <p>{formatDate(userData.updatedAt)}</p>
          </span>
          <hr />
          <span class="bar">
            <p class="property">Images uploaded:</p>
            <p>{imagesUploaded}</p>
          </span>
        </div>
      </div>
      <br />
      <br />
      <div class="options">
        <button class="submit-button delete" on:click={handleDeleteAccount}>Delete account</button>
        <button class="submit-button delete">Delete all images </button>
        <button class="submit-button edit">Edit profile </button>
      </div>
    {/await}
  </div>
</div>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .options {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .delete {
    background-color: rgb(195, 51, 51);
  }
  .edit {
    background-color: rgb(40, 124, 34);
  }
  .submit-button {
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
  }
  .loading-spinner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
  }
  .property {
    font-weight: bold;
    color: rgb(53, 67, 37);
    margin: 0;
  }
  .bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: center;
  }

  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0rem 5rem;
    margin-left: 14vw;
  }

  .main-card {
    background-color: #1ca496;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    padding: 1rem;
    color: white;
  }

  hr {
    border: 0;
    width: 100%;
    background-color: rgb(168, 162, 162);
    height: 1px;
  }

  .profile-info {
    display: flex;
    flex-direction: column;
  }
</style>
