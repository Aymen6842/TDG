import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CustomError } from "@/utils/custom-error";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { deleteElementOnServerSide } from "@/services/element-deletion";

/**
 * Custom hook for managing deletion of catalog elements (products, categories, brands, coupons).
 * Provides state management and methods for handling bulk and individual element deletions.
 *
 * @param type - The type of catalog element being managed ("product" | "category" | "brand" | "coupon")
 * @param parentElementId - Optional parent element ID for hierarchical deletions
 * @returns Object containing state and methods for element deletion management
 */
export default function useElementsDeletion(type: "user" | "team" | "task" | "comment" | "subTask" | "attachment" | "service" | "server") {
  const queryClient = useQueryClient();
  const [alertModalIsOpen, setAlertModalIsOpen] = useState(false);
  const [warning, setWarning] = useState("");
  const [elementsIds, setElementsIds] = useState<string[]>([]);
  const tErrors = useTranslations("shared.errors.deletion");
  const sharedErrors = useTranslations("shared.errors");
  const t = useTranslations("shared.success");
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    if (warning !== "" && alertModalIsOpen === false) setWarning("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertModalIsOpen]);

  /**
   * Deletes all elements in the deletion list from the server.
   * Invalidates relevant queries and resets state on success.
   */
  const deleteAllElements = async (onSuccess?: () => void) => {
    setIsPending(true);

    try {
      await Promise.all(elementsIds.map((elementId) => deleteElementOnServerSide(type, elementId)));

      if (warning !== "") setWarning("");

      queryClient.invalidateQueries({
        queryKey: type === "user" ? ["users"] : type === "team" ? ["teams"] : type === "task" || type === "comment" || type === "subTask" || type === "attachment" ? ["personal-tasks"] : ["server", "service"].includes(type) ? ["infrastructure"] : [],
        exact: false
      });

      setAlertModalIsOpen(false);
      setElementsIds([]);
      toast.success(t("deletion"));

      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (throwedError) {
      const error = throwedError as CustomError;
      if (error.status === 403) {
        toast.error(sharedErrors("permissionDenied"));
        setWarning(sharedErrors("permissionDenied"));
        return;
      } else {
        setWarning(tErrors("serverError"));
        toast.error(tErrors("serverError"));
      }
    }

    setIsPending(false);
  };

  /**
   * Opens the deletion confirmation modal if there are elements to delete.
   */
  const onDelete = () => {
    if (elementsIds.length > 0) setAlertModalIsOpen(true);
  };

  /**
   * Adds an element ID to the deletion list.
   * @param elementId - The ID of the element to add to deletion list
   */
  const addElementToDeletionList = (elementId: string) => {
    setElementsIds([...elementsIds, elementId]);
  };

  /**
   * Removes an element ID from the deletion list.
   * @param elementId - The ID of the element to remove from deletion list
   */
  const removeElementFromDeletionList = (elementId: string) => {
    const filterList = elementsIds.filter((id) => elementId !== id);
    setElementsIds(filterList);
  };

  /**
   * Directly remove an element without
   * in the deletion list and opening the confirmation modal.
   * @param elementId - The ID of the element to delete immediately
   */
  const removeElementDirectlyWithoutElementsSelection = (elementId: string) => {
    setElementsIds([elementId]);
    setAlertModalIsOpen(true);
  };

  /**
   * Closes the deletion confirmation modal and cancels the deletion process.
   */
  const cancelDeletion = () => {
    setAlertModalIsOpen(false);
  };

  return {
    isPending,
    alertModalIsOpen,
    cancelDeletion,
    warning,
    deleteAllElements,
    setElementsIds,
    addElementToDeletionList,
    removeElementFromDeletionList,
    onDelete,
    elementsIds,
    removeElementDirectlyWithoutElementsSelection
  };
}
