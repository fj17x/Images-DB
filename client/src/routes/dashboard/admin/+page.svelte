<script>
  import Dashboard from "$lib/components/Dashboard.svelte"
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { userDetails } from "../../../stores/userDetails.js"
  import { onMount } from "svelte"
  import { goto } from "$app/navigation"

  let showAlertModal = false
  let alertModalOptions = {}

  let users = []
  let totalUsers = 0
  let images = []
  let totalImages = 0

  let clickedBox = null

  const handleClick = (box) => {
    clickedBox = box
  }

  const clearClickedBox = () => {
    clickedBox = null
  }

  const getNumberOfUsers = async () => {
    const responseUsers = await fetch(`http://localhost:4000/users`, {
      method: "GET",
      credentials: "include",
    })
    const responseImages = await fetch(`http://localhost:4000/images`, {
      method: "GET",
      credentials: "include",
    })
    const replyUsers = await responseUsers.json()
    const replyImages = await responseImages.json()

    if (responseUsers.ok) {
      users = [...replyUsers.data]
      totalUsers = replyUsers.totalUsers
    }
    if (responseImages.ok) {
      images = [...replyImages.data]
      totalImages = replyImages.totalImages
    }
  }

  onMount(async () => {
    await getNumberOfUsers()
    if (!$userDetails.isAdmin) {
      alertModalOptions.header = "Cannot access page"
      alertModalOptions.message = "This page is only accessible by an admin."
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
    await getNumberOfUsers()
  })

  const onAlertConfirm = () => {
    goto("/dashboard/myimages")
    showAlertModal = false
  }
</script>

<div class="container">
  <Dashboard />
  <div class="contents">
    <div class="content">
      <h3>Statistics</h3>
      <div class="main-card">
        <div class="statistics">
          <button class="box blue" on:click={() => handleClick("users")}>
            <i class="fa-solid fa-users icon"></i>
            <p class="total-info">Total users</p>
            <p class="total-num">{totalUsers || ""}</p>
          </button>
          <button class="box green" on:click={() => handleClick("images")}>
            <i class="fa-regular fa-images icon"></i>
            <p class="total-info">Total images</p>
            <p class="total-num">{totalImages || ""}</p>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {onAlertConfirm} {...alertModalOptions}></AlertModal>
{/if}

<style>
  .total-num {
    font-size: 1.2rem;
    margin: 0px;
  }
  .total-info {
    font-size: 1.2rem;
  }

  .icon {
    font-size: 2.7rem;
    margin-top: 1 rem;
  }

  .statistics {
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .box {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    flex-direction: column;
    height: 10rem;
    width: 20rem;
    color: white;
    border-radius: 40%;
    cursor: pointer;
    transition: background-color 0.3s ease;
    border: none;
  }

  .blue {
    background-color: #ff4a42;
  }

  .green {
    background-color: #a3d301;
  }

  .container {
    display: flex;
  }

  .content {
    flex: 1;
    padding: 0px 2rem;
    margin-left: 14vw;
    width: 75vw;
  }

  .contents {
    display: flex;
    align-items: center;
    flex-direction: column;
  }

  .main-card {
    background-color: #ebebeb;
    border-radius: 0.8rem;
    box-shadow: 0 0.4rem 0.8rem rgba(0, 0, 0, 0.1);
    padding: 2rem 2rem 1rem 2rem;
  }
</style>
