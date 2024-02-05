<script>
  import { onMount } from "svelte"
  import Dashboard from "$lib/components/Dashboard.svelte"
  import FullImageCard from "$lib/components/FullImageCard.svelte"
  import ChoiceModal from "$lib/components/ChoiceModal.svelte"
  import EditImageModal from "$lib/components/EditImageModal.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { page } from "$app/stores"
  import { goto } from "$app/navigation"

  let showAlertModal = false
  let alertModalOptions = {}
  let currentOperation

  let showChoiceModal = false
  let choiceModalOptions = {}

  let image
  let imageId = $page.params.id

  let showEditImageModal = false

  const fetchImageWithId = async () => {
    const response = await fetch(`http://localhost:4000/images/${imageId}`, {
      method: "GET",
      credentials: "include",
    })

    const imagesReply = await response.json()
    image = imagesReply.data
  }

  const onEditConfirm = async (status, data) => {
    if (!status) {
      showEditImageModal = false
      return
    }
    if (data) {
      Object.keys(data).forEach((key) => (data[key] === undefined ? delete data[key] : {}))
    }

    showEditImageModal = false

    const response = await fetch(`http://localhost:4000/images/${$page.params.id}`, {
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
      await fetchImageWithId()
    } else {
      alertModalOptions.header = "Could not update"
      alertModalOptions.message = reply.error
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }

  const handleDelete = async () => {
    currentOperation = "delete"
    choiceModalOptions.header = "Confirm deletion"
    choiceModalOptions.text = "Are you sure you want to delete this image?"
    showChoiceModal = true
  }

  const onChoiceConfirm = async (confirmed) => {
    showChoiceModal = false
    if (!confirmed) {
      return
    }
    let response

    response = await fetch(`http://localhost:4000/images/${imageId}`, {
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

  const onAlertConfirm = () => {
    showAlertModal = false
    if (currentOperation === "delete") {
      goto("/dashboard/myimages")
      currentOperation = ""
    }
  }
</script>

<div class="container">
  <Dashboard />
  <div class="content {image === undefined ? 'none-found' : ''}">
    {#await fetchImageWithId()}
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
    {:then}
      <div class="main-card">
        {#if image}
          <div class="header">
            <h3>Image ID: {image.id}</h3>
            <div>
              <button class="top-button edit" on:click={() => (showEditImageModal = true)}>Edit</button>
              <button class="top-button delete" on:click={handleDelete}>Delete</button>
            </div>
          </div>
          <FullImageCard
            title={image.title}
            description={image.description}
            tags={image.tags}
            url={image.url}
            createdAt={image.createdAt}
            updatedAt={image.updatedAt}
            destroyTime={image.destroyTime}
            id={image.id}
          />
        {:else}
          <h1>Image not found!</h1>
        {/if}
      </div>
    {/await}
  </div>
</div>

{#if showEditImageModal}
  <EditImageModal
    bind:showModal={showEditImageModal}
    oldTitle={image.title}
    oldDescription={image.description}
    oldTags={image.tags}
    oldUrl={image.url}
    {onEditConfirm}
  ></EditImageModal>
{/if}
{#if showChoiceModal}
  <ChoiceModal bind:showModal={showChoiceModal} {onChoiceConfirm} {...choiceModalOptions}></ChoiceModal>
{/if}
{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {onAlertConfirm} {...alertModalOptions}></AlertModal>
{/if}

<style>
  @import url("https://fonts.googleapis.com/css?family=Poppins:400,700,900");

  .none-found {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
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

  .top-button {
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
  }

  .top-button:hover {
    transform: scale(1.05);
  }

  .edit {
    background-color: rgb(35, 107, 190);
  }
  .delete {
    background-color: #d72335;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .container {
    display: flex;
    background-color: rgb(254, 252, 252);
  }

  .content {
    margin-left: 14vw;
    flex: 1;
    padding: 0px 2rem;
  }

  .main-card {
    background-color: white;
    font-family: "Poppins", sans-serif;
    font-weight: 300;
    border-radius: 0.8rem;
    box-shadow: 0 0.1rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 1rem 2rem 2rem 2rem;
    margin: 2rem 0rem;
  }
</style>
