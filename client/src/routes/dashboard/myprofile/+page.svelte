<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
  import ChoiceModal from "$lib/components/ChoiceModal.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import EditProfileModal from "$lib/components/EditProfileModal.svelte"
  import { goto } from "$app/navigation"


  let showChoiceModal = false
  let choiceModalOptions = {}

  let userData = {}
  let imagesUploaded = 0
  let currentOperation

  let showAlertModal = false
  let alertModalOptions = {}

  let showEditProfileModal = false

  const getUserDetails = async () => {
    const response = await fetch(`http://localhost:4000/me`, {
      method: "GET",
      credentials: "include",
    })
    const reply = await response.json()
    if (response.ok) {
      userData = reply.data
      imagesUploaded = userData.imagesUploaded.length
    }
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    const formattedDate = new Date(dateString).toLocaleDateString("en-US", options)
    return formattedDate
  }

  const handleDeleteAccount = async () => {
    currentOperation = "deleteAccount"
    choiceModalOptions.header = "Confirm deletion"
    choiceModalOptions.text = "Are you sure you want to delete your account?"
    showChoiceModal = true
  }

  const handleDeleteAllImages = async () => {
    currentOperation = "deleteAllImages"
    choiceModalOptions.header = "Confirm deletion"
    choiceModalOptions.text = "Are you sure you want to delete all your images?"
    showChoiceModal = true
  }

  const onChoiceConfirm = async (confirmed) => {
    showChoiceModal = false
    if (!confirmed) {
      return
    }
    let response
    if (currentOperation === "deleteAccount") {
      response = await fetch(`http://localhost:4000/me`, {
        method: "DELETE",
        credentials: "include",
      })
    } else if (currentOperation === "deleteAllImages") {
      response = await fetch(`http://localhost:4000/images`, {
        method: "DELETE",
        credentials: "include",
      })
    } else {
      return
    }

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

  const onAlertConfirm = () => {
    showAlertModal = false
    if (currentOperation === "deleteAccount") {
      goto("/")
    }
  }

  const onEditConfirm = async (status, data) => {
    if (!status) {
      showEditProfileModal = false
      return
    }
    if (data) {
      Object.keys(data).forEach((key) => (data[key] === undefined ? delete data[key] : {}))
    }

    showEditProfileModal = false

    const response = await fetch(`http://localhost:4000/me`, {
      method: "PATCH",
      credentials: "include",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    })

    const reply = await response.json()
    if (response.ok) {
      alertModalOptions.header = "Successfully updated"
      alertModalOptions.message = reply.message
      alertModalOptions.type = "success"
      showAlertModal = true
      await getUserDetails()
    } else {
      alertModalOptions.header = "Could not update"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }
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
            <p class="property">Username:</p>
            <p>{userData.userName}</p>
          </span>
          <hr />
          <span class="bar">
            <p class="property">Profile created on</p>
            <p>{formatDate(userData.createdAt)}</p>
          </span>
          <hr />
          <span class="bar">
            <p class="property">Profile last modified on:</p>
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
        <button class="submit-button delete" on:click={handleDeleteAllImages}>Delete all your images </button>
        <button class="submit-button edit" on:click={() => (showEditProfileModal = true)}>Update profile </button>
      </div>
    {/await}
  </div>
</div>

{#if showChoiceModal}
  <ChoiceModal bind:showModal={showChoiceModal} {onChoiceConfirm} {...choiceModalOptions}></ChoiceModal>
{/if}
{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {onAlertConfirm} {...alertModalOptions}></AlertModal>
{/if}{#if showEditProfileModal}
  <EditProfileModal bind:showModal={showEditProfileModal} {onEditConfirm} oldUserName={userData.userName}></EditProfileModal>
{/if}

<style>
  .container {
    display: flex;
    background-color: rgb(254, 252, 252);
  }

  .options {
    display: flex;
    justify-content: space-around;
    align-items: center;
    gap: 10px;
  }

  .delete {
    background-color: rgb(195, 51, 51);
  }
  .edit {
    background-color: rgb(40, 124, 34);
  }

  .submit-button {
    font-size: 0.85rem;
    border-radius: 0.3rem;
    color: #fff;
    cursor: pointer;
    border: none;
    padding: 0.5rem 1rem;
  }
  .submit-button:hover {
    transform: scale(1.05);
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

  @media screen and (max-width: 786px) {
    .options {
      flex-direction: column;
      gap: 7px;
    }
  }
</style>
