<script>
  import { goto } from "$app/navigation"
  import ChoiceModal from "./ChoiceModal.svelte"
  import AlertModal from "./AlertModal.svelte"
  import { page } from "$app/stores"
  import { userDetails } from "../../stores/userDetails.js"

  let showChoiceModal = false
  let choiceModalOptions = {}
  choiceModalOptions.header = "Confirm logout"
  choiceModalOptions.text = "Are you sure you want to logout?"

  let showAlertModal = false
  let alertModalOptions = {}

  const onChoiceConfirmForLogout = async (confirmed) => {
    showChoiceModal = false
    if (!confirmed) {
      return
    }
    const response = await fetch(`http://localhost:4000/v1/auth/logout`, {
      method: "GET",
      credentials: "include",
    })
    if (response.ok) {
      userDetails.set({})
      goto("/")
    } else {
      alertModalOptions.header = "Could not logout"
      alertModalOptions.message = "Please try again!"
      alertModalOptions.type = "failure"
      showAlertModal = true
    }
  }
</script>

<div class="sidebar d-flex flex-column align-items-center justify-content-evenly">
  {#if $userDetails}
    <div class="d-flex text-white justify-content-center align-items-center flex-column text-center">
      <i class="fa fa-home fa-xl mb-2" aria-hidden="true"></i><a
        href="/"
        class="sidebar-text text-white d-flex justify-content-center align-items-center {$page.route.id === '/' ? 'active' : ''}"
      >
        <p>Home</p></a
      >
    </div>
    <div
      class="d-flex text-white justify-content-center align-items-center flex-column text-center {$page.route.id.startsWith(
        '/dashboard/myimages'
      )
        ? 'active'
        : ''}"
    >
      <i class="fa fa-images fa-xl mb-2" aria-hidden="true"></i><a
        href="/dashboard/myimages"
        class="sidebar-text text-white d-flex justify-content-center align-items-center"><p>My Images</p></a
      >
    </div>
    <div
      class="d-flex text-white justify-content-center align-items-center flex-column text-center {$page.route.id.startsWith(
        '/dashboard/upload'
      )
        ? 'active'
        : ''}"
    >
      <i class="fa fa-cloud-upload fa-xl mb-2" aria-hidden="true"></i><a
        href="/dashboard/upload"
        class="sidebar-text text-white d-flex justify-content-center align-items-center"><p>Upload</p></a
      >
    </div>
    <div
      class="d-flex text-white justify-content-center align-items-center flex-column text-center {$page.route.id.startsWith(
        '/dashboard/search'
      )
        ? 'active'
        : ''}"
    >
      <i class="fa fa-search fa-xl mb-2" aria-hidden="true"></i><a
        href="/dashboard/search"
        class="sidebar-text text-white d-flex justify-content-center align-items-center"><p>Search</p></a
      >
    </div>
    <div
      class="d-flex text-white justify-content-center align-items-center flex-column text-center {$page.route.id.startsWith(
        '/dashboard/myprofile'
      )
        ? 'active'
        : ''}"
    >
      <i class="fa fa-user fa-xl mb-2" aria-hidden="true"></i><a
        href="/dashboard/myprofile"
        class="sidebar-text text-white d-flex justify-content-center align-items-center"
      >
        <p class="my-profile-info">My Profile <br />({$userDetails.userName ?? ""})</p>
      </a>
    </div>

    {#if $userDetails.isAdmin}
      <div
        class="d-flex text-white justify-content-center align-items-center flex-column text-center {$page.route.id.startsWith(
          '/dashboard/admin'
        )
          ? 'active'
          : ''}"
      >
        <i class="fa-solid fa-gears fa-xl mb-2"></i><a
          href="/dashboard/admin"
          class="sidebar-text text-white d-flex justify-content-center align-items-center"
          ><p class="admin-text">Admin Panel</p>
        </a>
      </div>
    {/if}
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div
      class="d-flex text-white justify-content-center align-items-center flex-column text-center logout"
      on:click={() => (showChoiceModal = true)}
    >
      <i class="fa fa-sign-out fa-lg fa-xl mb-2" aria-hidden="true"></i>
      <p>Log out</p>
    </div>
  {/if}
  {#if showChoiceModal}
    <ChoiceModal bind:showModal={showChoiceModal} onChoiceConfirm={onChoiceConfirmForLogout} {...choiceModalOptions}
    ></ChoiceModal>
  {/if}
  {#if showAlertModal}
    <AlertModal bind:showModal={showAlertModal} {...alertModalOptions}></AlertModal>
  {/if}
</div>

<style>
  .sidebar {
    width: 15rem;
    background-color: #172740;
    height: 100vh;
    width: 10vw;
    min-width: 100px;
    position: fixed;
  }

  .my-profile-info {
    text-transform: capitalize;
  }

  .sidebar-text {
    font-size: 1rem;
    text-decoration: none;
  }

  .logout {
    cursor: pointer;
  }

  .active {
    text-shadow: 0 0 20px #fff;
  }
</style>
