<script>
  import AlertModal from "$lib/components/AlertModal.svelte"
  import { goto } from "$app/navigation"

  let showAlertModal = false
  let alertModalOptions = {}

  const onAlertConfirm = () => {
    goto("/")
    showAlertModal = false
  }
</script>

{#if showAlertModal}
  <AlertModal bind:showModal={showAlertModal} {...alertModalOptions} {onAlertConfirm}></AlertModal>
{/if}

<slot />
