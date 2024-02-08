<script>
  import Sidebar from "$lib/components/Sidebar.svelte"
  import ChoiceModal from "$lib/components/ChoiceModal.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import EditProfileModal from "$lib/components/EditProfileModal.svelte"
  import { goto } from "$app/navigation"
  import { userDetails } from "../../../stores/userDetails.js"

  let showChoiceModal = false
  let choiceModalOptions = {}

  let currentOperation

  let showAlertModal = false
  let alertModalOptions = {}

  let showEditProfileModal = false

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
      userDetails.set({})
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
      userDetails.update((user) => {
        return { ...user, ...data, updatedAt: formatDate(Date.now()) }
      })
    } else {
      alertModalOptions.header = "Could not update"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }
</script>

<div class="container-fluid p-0 m-0">
  <Sidebar />
  <div class="content d-flex align-items-center flex-column pt-5">
    <h3>Your Profile:</h3>
    <div class="main-card p-4 mt-2">
      {#if $userDetails.id}
        <div class="d-flex flex-column">
          <div class="bar">
            <p class="fw-bold m-0">User ID:</p>
            <p class="fw-bold m-0 result d-flex align-items-center justify-content-center fw-semibold">{$userDetails.id}</p>
          </div>
          <hr />
          <div class="bar">
            <p class="fw-bold m-0">Username:</p>
            <p class="fw-bold m-0 result d-flex align-items-center justify-content-center fw-semibold">{$userDetails.userName}</p>
          </div>
          <hr />
          <div class="bar">
            <p class="fw-bold m-0">Profile created on:</p>
            <p class="fw-bold m-0 result d-flex align-items-center justify-content-center fw-semibold">
              {formatDate($userDetails.createdAt)}
            </p>
          </div>
          <hr />
          <div class="bar">
            <p class="fw-bold m-0">Profile last modified on:</p>
            <p class="fw-bold m-0 result d-flex align-items-center justify-content-center fw-semibold">
              {formatDate($userDetails.updatedAt)}
            </p>
          </div>
          <hr />
          <div class="bar">
            <p class="fw-bold m-0">Images uploaded:</p>
            <p class="fw-bold m-0 result d-flex align-items-center justify-content-center fw-semibold">
              {$userDetails?.imagesUploaded?.length}
            </p>
          </div>
        </div>
      {:else}
        <div class="loading-spinner d-flex justify-content-center align-items-center text-dark">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      {/if}
    </div>
    <br />
    <br />
    <div class="options d-flex justify-content-around align-items-center gap-2">
      <button class="btn delete text-white" on:click={handleDeleteAccount}>Delete account</button>
      <button class="btn delete text-white" on:click={handleDeleteAllImages}>Delete all your images </button>
      <button class="btn edit text-white" on:click={() => (showEditProfileModal = true)}>Update profile </button>
    </div>
  </div>
</div>

{#if showChoiceModal}
  <ChoiceModal bind:showModal={showChoiceModal} {onChoiceConfirm} {...choiceModalOptions}></ChoiceModal>
{/if}
{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {onAlertConfirm} {...alertModalOptions}></AlertModal>
{/if}
{#if showEditProfileModal}
  <EditProfileModal bind:showModal={showEditProfileModal} {onEditConfirm} oldUserName={$userDetails.userName}></EditProfileModal>
{/if}

<style>
  .loading-spinner {
    top: 0;
    left: 0;
    width: 100%;
    height: 200px;
  }
  .content {
    flex: 1;
    margin-left: 14vw;
    width: 75vw;
  }

  .delete {
    background-color: rgb(195, 51, 51);
  }
  .edit {
    background-color: rgb(40, 124, 34);
  }

  .btn:hover {
    transform: scale(1.04);
  }

  .result {
    color: rgb(53, 67, 37);
  }

  .bar {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    align-items: center;
    justify-content: center;
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
    color: white;
  }

  @media screen and (max-width: 786px) {
    .options {
      flex-direction: column;
      gap: 7px;
    }
  }
</style>
