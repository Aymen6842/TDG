import { POST } from "@/lib/http-methods";
import { AxiosError } from "axios";
import { CustomError } from "@/utils/custom-error";
import { ErrorDataResponse } from "@/types";
import extractJWTokens from "@/modules/auth/utils/jwt/extract-tokens";
import { refreshToken } from "@/modules/auth/services/refresh-token";
import { CommentFormSchema } from "../../validation/comment.shema";
import { CommentType } from "../../types/comment";

interface Params {
  comment: CommentType;
}

export default async function uploadCommentOnServerSide({ comment }: Params) {
  const { access } = extractJWTokens();
  const headers = {
    Authorization: `Bearer ${access}`
  };

  try {
    const response = await POST(`/personal-tasks/comments/register`, headers, comment);
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<ErrorDataResponse>;

    if (axiosError.response?.status === 401) {
      const res = await refreshToken(() => uploadCommentOnServerSide({ comment }));

      if (!res) throw new CustomError("Unauthorized", 401);
      return res;
    } else if (axiosError.response?.status === 400) {
      if (axiosError.response?.data.code === "P2000") {
        throw new CustomError("Comment already exist!", 400, "COMMENT_ALREADY_EXIST");
      } else throw new CustomError("Invalid format!", 400);
    } else
      throw new CustomError(
        axiosError.response?.data?.message || "Failed to register comment ",
        axiosError.response?.status || 500
      );
  }
}
